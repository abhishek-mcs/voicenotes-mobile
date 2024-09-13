//
//  ComplicationController.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 9/13/24.
//

import Foundation
import ClockKit


class ComplicationController: NSObject, CLKComplicationDataSource {
  func getSupportedTimeTravelDirections(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTimeTravelDirections) -> Void) {
    handler([.forward, .backward])
  }
  
  func getTimelineStartDate(for complication: CLKComplication, withHandler handler: @escaping (Date?) -> Void) {
    handler(nil)
  }
  
  func getTimelineEndDate(for complication: CLKComplication, withHandler handler: @escaping (Date?) -> Void) {
    handler(nil)
  }
  
  func getPrivacyBehavior(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationPrivacyBehavior) -> Void) {
    handler(.showOnLockScreen)
  }
  
  func getCurrentTimelineEntry(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void) {
    let template = createTemplate(for: complication)
    let entry = CLKComplicationTimelineEntry(date: Date(), complicationTemplate: template)
    handler(entry)
  }
  
  func getTimelineEntries(for complication: CLKComplication, after date: Date, limit: Int, withHandler handler: @escaping ([CLKComplicationTimelineEntry]?) -> Void) {
    handler(nil)
  }
  
  func getLocalizableSampleTemplate(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTemplate?) -> Void) {
    let template = createTemplate(for: complication)
    handler(template)
  }
  
  private func createTemplate(for complication: CLKComplication) -> CLKComplicationTemplate {
    switch complication.family {
    case .circularSmall:
      let imageProvider = CLKImageProvider(onePieceImage: UIImage(named: "appIcon")!)
      let imageTemplate = CLKComplicationTemplateCircularSmallSimpleImage(imageProvider: imageProvider)
      return imageTemplate
    default:
      fatalError("Complication family not supported")
    }
  }
}
