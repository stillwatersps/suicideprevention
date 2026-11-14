import XCTest
@testable import TidelightLogic

final class DwellTrackerTests: XCTestCase {
    let t0 = Date(timeIntervalSince1970: 1_800_000_000)
    func minutes(_ m: Double) -> Date { t0.addingTimeInterval(m * 60) }

    func testEnteringSchedulesAfterTheDwellTime() {
        var tracker = DwellTracker(dwell: 20 * 60)
        XCTAssertEqual(tracker.entered("bridge", at: t0), .schedule(placeId: "bridge", fireAt: minutes(20)))
        XCTAssertNil(tracker.dueAlert(at: minutes(19)), "nothing is due before the dwell time")
        XCTAssertEqual(tracker.dueAlert(at: minutes(20)), DwellTracker.DueAlert(placeId: "bridge", since: t0))
    }

    func testPassingThroughNeverAlerts() {
        var tracker = DwellTracker(dwell: 10 * 60)
        _ = tracker.entered("station", at: t0)
        XCTAssertEqual(tracker.exited("station", at: minutes(3)), .cancel(placeId: "station"))
        XCTAssertNil(tracker.dueAlert(at: minutes(30)))
        XCTAssertTrue(tracker.inside.isEmpty, "no record of the visit stays behind")
    }

    func testEnteringTwiceKeepsTheFirstEntryTime() {
        var tracker = DwellTracker(dwell: 10 * 60)
        _ = tracker.entered("park", at: t0)
        XCTAssertNil(tracker.entered("park", at: minutes(5)), "a repeated entry event changes nothing")
        XCTAssertEqual(tracker.dueAlert(at: minutes(10))?.since, t0)
    }

    func testImOkayStopsAlertsUntilTheyLeave() {
        var tracker = DwellTracker(dwell: 10 * 60)
        _ = tracker.entered("park", at: t0)
        XCTAssertEqual(tracker.acknowledge("park"), .cancel(placeId: "park"))
        XCTAssertNil(tracker.dueAlert(at: minutes(60)), "no second alert during the same visit")
        XCTAssertNil(tracker.entered("park", at: minutes(61)), "a repeated entry while acknowledged schedules nothing")
        _ = tracker.exited("park", at: minutes(90))
        XCTAssertEqual(tracker.entered("park", at: minutes(120)), .schedule(placeId: "park", fireAt: minutes(130)),
                       "a new visit can alert again")
    }

    func testExitingAnUnknownPlaceDoesNothing() {
        var tracker = DwellTracker(dwell: 600)
        XCTAssertNil(tracker.exited("nowhere", at: t0))
    }

    func testChangingTheDwellReschedulesFromTheEntryTime() {
        var tracker = DwellTracker(dwell: 30 * 60)
        _ = tracker.entered("a", at: t0)
        _ = tracker.entered("b", at: minutes(5))
        _ = tracker.acknowledge("b")
        let actions = tracker.setDwell(10 * 60, at: minutes(6))
        XCTAssertEqual(actions, [.schedule(placeId: "a", fireAt: minutes(10))], "acknowledged places aren't rescheduled")
        XCTAssertEqual(tracker.dueAlert(at: minutes(10))?.placeId, "a")
    }

    func testRemovingAPlaceEndsItsVisit() {
        var tracker = DwellTracker(dwell: 600)
        _ = tracker.entered("old", at: t0)
        _ = tracker.entered("kept", at: t0)
        XCTAssertEqual(tracker.keepOnly(["kept"], at: minutes(1)), [.cancel(placeId: "old")])
        XCTAssertEqual(tracker.inside.keys.sorted(), ["kept"])
    }

    func testResetCancelsEverything() {
        var tracker = DwellTracker(dwell: 600)
        _ = tracker.entered("a", at: t0)
        _ = tracker.entered("b", at: t0)
        XCTAssertEqual(tracker.reset(), [.cancel(placeId: "a"), .cancel(placeId: "b")])
        XCTAssertNil(tracker.dueAlert(at: minutes(60)))
    }

    func testTheLongestStayIsDueFirst() {
        var tracker = DwellTracker(dwell: 600)
        _ = tracker.entered("later", at: minutes(2))
        _ = tracker.entered("earlier", at: t0)
        XCTAssertEqual(tracker.dueAlert(at: minutes(20))?.placeId, "earlier")
    }

    func testSurvivesBeingSavedAsJSON() throws {
        var tracker = DwellTracker(dwell: 1200)
        _ = tracker.entered("a", at: t0)
        _ = tracker.acknowledge("a")
        let data = try JSONEncoder().encode(tracker)
        let back = try JSONDecoder().decode(DwellTracker.self, from: data)
        XCTAssertEqual(back, tracker)
    }

    func testNegativeDwellIsTreatedAsZero() {
        var tracker = DwellTracker(dwell: -5)
        XCTAssertEqual(tracker.entered("a", at: t0), .schedule(placeId: "a", fireAt: t0))
    }
}
