import UIKit
import Capacitor

// The app's web view, with the Tidelight native plugin registered. Set in Main.storyboard.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(TidelightPlugin())
    }

    // The website is many pages in folders (check-in/, es/, about/), not a single-page app.
    // Capacitor's own router sends every folder address to the root index.html, so links between
    // pages would all open Home. This one opens the folder's own index.html when it exists.
    override open func router() -> Router {
        return TidelightRouter()
    }
}

struct TidelightRouter: Router {
    var basePath: String = ""
    func route(for path: String) -> String {
        let url = URL(fileURLWithPath: path)
        if url.pathExtension.isEmpty {
            let folder = path.hasSuffix("/") ? path : path + "/"
            let candidate = basePath + folder + "index.html"
            if FileManager.default.fileExists(atPath: candidate) { return candidate }
            return basePath + "/index.html"
        }
        return basePath + path
    }
}
