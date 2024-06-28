//
//  MessageModel.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/27/24.
//

import Foundation

struct MessageModel: Codable {
  let id: String
  let title: String
  let createdAt: String
  let updatedAt: String
  let relatedMessages: [RelatedMessageModel]
  
  enum CodingKeys: String, CodingKey {
    case id
    case title
    case createdAt = "created_at"
    case updatedAt = "updated_at"
    case relatedMessages = "related_messages"
  }
}

struct RelatedMessageModel: Codable {
  let id: String
  let aiChatThreadId: String
  let question: String
  let answer: String
  let questionUrl: String
  let answerUrl: String?
  let createdAt: String
  let updatedAt: String
  let source: [String]
  
  enum CodingKeys: String, CodingKey {
    case id
    case aiChatThreadId = "ai_chat_thread_id"
    case question
    case answer
    case questionUrl = "question_url"
    case answerUrl = "answer_url"
    case createdAt = "created_at"
    case updatedAt = "updated_at"
    case source
  }
}
