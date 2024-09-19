//
//  ConversationModel.swift
//  WatchApp Watch App
//
//  Created by Andriy Hrytsyshyn on 6/27/24.
//

import Foundation

struct ConversationModel: Codable {
  let id: Int
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
  let id: Int
  let aiChatThreadId: Int
  let question: String
  let answer: String
  let questionUrl: String
  let answerUrl: String?
  let createdAt: String
  let updatedAt: String
  let source: [MessageSource]
  
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

struct MessageSource: Codable {
  let id: String
  let transcript: String
  let title: String
  let createdAt: String
  
  enum CodingKeys: String, CodingKey {
    case id
    case transcript
    case title
    case createdAt = "created_at"
  }
}
