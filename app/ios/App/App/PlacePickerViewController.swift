import UIKit
import MapKit
import CoreLocation

// A full-screen map for choosing one of the person's own places: a pin, a radius, and a name.
// The app suggests no places. Searching an address uses Apple's map search, which needs a signal.
// Every label comes from the page's text files through `words`; nothing here is wording of its own.
final class PlacePickerViewController: UIViewController, MKMapViewDelegate, UISearchBarDelegate, CLLocationManagerDelegate {
    struct Place { var name: String; var latitude: Double; var longitude: Double; var radius: Double }

    var completion: ((Place?) -> Void)?

    private let words: [String: Any]
    private var place: Place?
    private let defaultRadius: Double
    private let map = MKMapView()
    private let search = UISearchBar()
    private let nameField = UITextField()
    private let radiusSlider = UISlider()
    private let radiusLabel = UILabel()
    private let hint = UILabel()
    private let hereButton = UIButton(type: .system)
    private var circle: MKCircle?
    private var pin: MKPointAnnotation?
    private let locator = CLLocationManager()

    init(words: [String: Any], initial: Place?, defaultRadius: Double) {
        self.words = words
        self.place = initial
        self.defaultRadius = max(100, min(defaultRadius, 500))
        super.init(nibName: nil, bundle: nil)
    }
    required init?(coder: NSCoder) { fatalError("not used") }

    private func word(_ key: String) -> String { words[key] as? String ?? key }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = word("title")
        navigationItem.leftBarButtonItem = UIBarButtonItem(title: word("cancel"), style: .plain, target: self, action: #selector(cancelTapped))
        navigationItem.rightBarButtonItem = UIBarButtonItem(title: word("save"), style: .done, target: self, action: #selector(saveTapped))

        search.placeholder = word("searchPlaceholder")
        search.delegate = self
        search.searchBarStyle = .minimal

        map.delegate = self
        map.showsUserLocation = true
        map.addGestureRecognizer(UILongPressGestureRecognizer(target: self, action: #selector(longPressed(_:))))
        map.accessibilityLabel = word("mapLabel")

        hint.text = word("hint")
        hint.font = .preferredFont(forTextStyle: .footnote)
        hint.numberOfLines = 0
        hint.textColor = .secondaryLabel

        hereButton.setTitle(word("useHere"), for: .normal)
        hereButton.addTarget(self, action: #selector(useHere), for: .touchUpInside)

        nameField.placeholder = word("namePlaceholder")
        nameField.borderStyle = .roundedRect
        nameField.autocorrectionType = .default
        nameField.accessibilityLabel = word("nameLabel")

        radiusSlider.minimumValue = 100
        radiusSlider.maximumValue = 500
        radiusSlider.value = Float(place?.radius ?? defaultRadius)
        radiusSlider.addTarget(self, action: #selector(radiusChanged), for: .valueChanged)
        radiusSlider.accessibilityLabel = word("radiusLabel")
        radiusLabel.font = .preferredFont(forTextStyle: .body)
        radiusLabel.adjustsFontForContentSizeCategory = true

        let controls = UIStackView(arrangedSubviews: [hint, hereButton, nameField, radiusLabel, radiusSlider])
        controls.axis = .vertical
        controls.spacing = 8
        controls.isLayoutMarginsRelativeArrangement = true
        controls.layoutMargins = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)

        let stack = UIStackView(arrangedSubviews: [search, map, controls])
        stack.axis = .vertical
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            stack.bottomAnchor.constraint(equalTo: view.keyboardLayoutGuide.topAnchor),
            map.heightAnchor.constraint(greaterThanOrEqualToConstant: 220),
        ])

        locator.delegate = self
        if let p = place {
            nameField.text = p.name
            setPin(CLLocationCoordinate2D(latitude: p.latitude, longitude: p.longitude), zoom: true)
        } else {
            radiusChanged()
        }
    }

    private var radius: Double { Double(Int(radiusSlider.value / 10) * 10) }

    @objc private func radiusChanged() {
        radiusLabel.text = word("radiusText").replacingOccurrences(of: "{meters}", with: String(Int(radius)))
        if let p = place { place?.radius = radius; setPin(CLLocationCoordinate2D(latitude: p.latitude, longitude: p.longitude), zoom: false) }
    }

    @objc private func longPressed(_ gesture: UILongPressGestureRecognizer) {
        guard gesture.state == .began else { return }
        let point = gesture.location(in: map)
        setPin(map.convert(point, toCoordinateFrom: map), zoom: false)
    }

    @objc private func useHere() {
        if locator.authorizationStatus == .notDetermined { locator.requestWhenInUseAuthorization() }
        locator.requestLocation()
    }

    private func setPin(_ coordinate: CLLocationCoordinate2D, zoom: Bool) {
        let name = nameField.text ?? ""
        place = Place(name: name, latitude: coordinate.latitude, longitude: coordinate.longitude, radius: radius)
        if let old = pin { map.removeAnnotation(old) }
        if let old = circle { map.removeOverlay(old) }
        let annotation = MKPointAnnotation()
        annotation.coordinate = coordinate
        map.addAnnotation(annotation)
        pin = annotation
        let overlay = MKCircle(center: coordinate, radius: radius)
        map.addOverlay(overlay)
        circle = overlay
        if zoom { map.setRegion(MKCoordinateRegion(center: coordinate, latitudinalMeters: radius * 6, longitudinalMeters: radius * 6), animated: true) }
    }

    func mapView(_ mapView: MKMapView, rendererFor overlay: MKOverlay) -> MKOverlayRenderer {
        guard let c = overlay as? MKCircle else { return MKOverlayRenderer(overlay: overlay) }
        let r = MKCircleRenderer(circle: c)
        r.fillColor = UIColor.systemBlue.withAlphaComponent(0.15)
        r.strokeColor = UIColor.systemBlue
        r.lineWidth = 2
        return r
    }

    func searchBarSearchButtonClicked(_ searchBar: UISearchBar) {
        guard let text = searchBar.text, !text.isEmpty else { return }
        searchBar.resignFirstResponder()
        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = text
        request.region = map.region
        MKLocalSearch(request: request).start { [weak self] response, _ in
            guard let self = self else { return }
            if let item = response?.mapItems.first {
                if (self.nameField.text ?? "").isEmpty { self.nameField.text = item.name }
                self.setPin(item.placemark.coordinate, zoom: true)
            } else {
                self.hint.text = self.word("notFound")
            }
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let here = locations.last { setPin(here.coordinate, zoom: true) }
    }
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        hint.text = word("noLocation")
    }
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        if manager.authorizationStatus == .authorizedWhenInUse || manager.authorizationStatus == .authorizedAlways { manager.requestLocation() }
    }

    @objc private func cancelTapped() {
        dismiss(animated: true) { [weak self] in self?.completion?(nil) }
    }

    @objc private func saveTapped() {
        guard var p = place else { hint.text = word("needPin"); return }
        let name = (nameField.text ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { hint.text = word("needName"); nameField.becomeFirstResponder(); return }
        p.name = name
        p.radius = radius
        dismiss(animated: true) { [weak self] in self?.completion?(p) }
    }
}
