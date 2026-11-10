// swift-tools-version:5.9
// Pure logic shared by the Tidelight iPhone app and its unit tests. No UIKit, no CoreLocation:
// the app's PlaceWatcher feeds it region events and acts on what it returns.
// Run the tests from app/ios/TidelightLogic with `swift test`.
import PackageDescription

let package = Package(
    name: "TidelightLogic",
    platforms: [.iOS(.v14), .macOS(.v12)],
    products: [.library(name: "TidelightLogic", targets: ["TidelightLogic"])],
    targets: [
        .target(name: "TidelightLogic"),
        .testTarget(name: "TidelightLogicTests", dependencies: ["TidelightLogic"]),
    ]
)
