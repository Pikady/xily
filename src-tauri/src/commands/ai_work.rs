use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::get_connection;
use crate::models::{Work, CreateWorkParams};
use rusqlite::{Result, params};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct AISession {
    pub session_id: String,
    pub stage: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIResponse {
    pub message: String,
    pub stage: Option<String>,
    pub extracted_data: Option<ExtractedWorkData>,
    pub motivation_data: Option<MotivationData>,
    pub suggestions: Option<AISuggestions>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AISuggestions {
    pub quick_replies: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtractedWorkData {
    pub name: String,
    pub description: Option<String>,
    pub target_hours: f64,
    pub color: Option<String>,
    pub suggestions: Option<WorkSuggestions>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkSuggestions {
    pub name_alternatives: Option<Vec<String>>,
    pub color_recommendations: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MotivationData {
    pub woop: Option<WoopData>,
    pub implementation_intentions: Option<Vec<ImplementationIntention>>,
    pub commitments: Option<CommitmentData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WoopData {
    pub wish: String,
    pub outcome: String,
    pub obstacle: String,
    pub plan: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImplementationIntention {
    pub if_condition: String,
    pub then_action: String,
    pub priority: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommitmentData {
    pub statement: String,
    pub commitment_type: String,
}

// 开始AI会话
#[tauri::command]
pub async fn start_ai_session() -> Result<AISession, String> {
    let session_id = Uuid::new_v4().to_string();

    Ok(AISession {
        session_id,
        stage: "greeting".to_string(),
        status: "active".to_string(),
    })
}

// 发送AI消息
#[tauri::command]
pub async fn send_ai_message(
    session_id: String,
    message: String,
    context: String,
) -> Result<AIResponse, String> {
    println!("AI Message: {}", message);

    // 简单的关键词匹配来模拟AI响应
    let response = if message.contains("书") || message.contains("写") {
        AIResponse {
            message: "听起来你想创作一本很棒的书！能告诉我更多关于这本书的想法吗？比如是什么类型的书，你希望通过这本书传达什么？".to_string(),
            stage: Some("discovery".to_string()),
            extracted_data: Some(ExtractedWorkData {
                name: "我的创作项目".to_string(),
                description: Some("一个有意义的创作项目".to_string()),
                target_hours: 40.0,
                color: Some("#3498db".to_string()),
                suggestions: Some(WorkSuggestions {
                    name_alternatives: Some(vec![
                        "创意项目".to_string(),
                        "我的作品".to_string(),
                    ]),
                    color_recommendations: Some(vec![
                        "#e67e22".to_string(),
                        "#2ecc71".to_string(),
                    ]),
                }),
            }),
            motivation_data: None,
            suggestions: Some(AISuggestions {
                quick_replies: Some(vec![
                    "我想写一本小说".to_string(),
                    "我想写一本技术书籍".to_string(),
                    "我想写一本自助书籍".to_string(),
                ]),
            }),
            metadata: serde_json::json!({}),
        }
    } else if message.contains("应用") || message.contains("开发") {
        AIResponse {
            message: "开发应用是个很棒的想法！你能具体说说这个应用是用来做什么的吗？是解决什么问题，或者为谁服务的？".to_string(),
            stage: Some("discovery".to_string()),
            extracted_data: Some(ExtractedWorkData {
                name: "我的应用项目".to_string(),
                description: Some("一个有用的应用程序".to_string()),
                target_hours: 60.0,
                color: Some("#e67e22".to_string()),
                suggestions: Some(WorkSuggestions {
                    name_alternatives: Some(vec![
                        "创新应用".to_string(),
                        "实用工具".to_string(),
                    ]),
                    color_recommendations: Some(vec![
                        "#3498db".to_string(),
                        "#9b59b6".to_string(),
                    ]),
                }),
            }),
            motivation_data: None,
            suggestions: Some(AISuggestions {
                quick_replies: Some(vec![
                    "这是一个移动应用".to_string(),
                    "这是一个Web应用".to_string(),
                    "这是一个桌面应用".to_string(),
                ]),
            }),
            metadata: serde_json::json!({}),
        }
    } else if message.contains("学习") || message.contains("技能") {
        AIResponse {
            message: "学习新技能是很棒的目标！你想学习什么具体的技能呢？这个技能对你来说有什么特别的意义？".to_string(),
            stage: Some("discovery".to_string()),
            extracted_data: Some(ExtractedWorkData {
                name: "我的学习计划".to_string(),
                description: Some("一个有意义的学习项目".to_string()),
                target_hours: 30.0,
                color: Some("#2ecc71".to_string()),
                suggestions: Some(WorkSuggestions {
                    name_alternatives: Some(vec![
                        "技能提升".to_string(),
                        "成长计划".to_string(),
                    ]),
                    color_recommendations: Some(vec![
                        "#3498db".to_string(),
                        "#e67e22".to_string(),
                    ]),
                }),
            }),
            motivation_data: None,
            suggestions: Some(AISuggestions {
                quick_replies: Some(vec![
                    "我想学习编程".to_string(),
                    "我想学习设计".to_string(),
                    "我想学习语言".to_string(),
                ]),
            }),
            metadata: serde_json::json!({}),
        }
    } else if message.contains("小说") {
        AIResponse {
            message: "创作小说是个很有意思的项目！基于我们的对话，我为你提取了以下信息：".to_string(),
            stage: Some("information_gathering".to_string()),
            extracted_data: Some(ExtractedWorkData {
                name: "我的第一部小说".to_string(),
                description: Some("一部充满想象力的小说作品".to_string()),
                target_hours: 80.0,
                color: Some("#9b59b6".to_string()),
                suggestions: Some(WorkSuggestions {
                    name_alternatives: Some(vec![
                        "梦想之书".to_string(),
                        "故事的力量".to_string(),
                        "文字世界".to_string(),
                    ]),
                    color_recommendations: Some(vec![
                        "#3498db".to_string(),
                        "#e67e22".to_string(),
                        "#2ecc71".to_string(),
                    ]),
                }),
            }),
            motivation_data: None,
            suggestions: Some(AISuggestions {
                quick_replies: Some(vec![
                    "信息看起来不错".to_string(),
                    "我想调整一下".to_string(),
                    "继续动机分析".to_string(),
                ]),
            }),
            metadata: serde_json::json!({}),
        }
    } else if message.contains("不错") || message.contains("很好") {
        AIResponse {
            message: "很好！现在让我们用WOOP方法来增强你的创作动力：".to_string(),
            stage: Some("motivation".to_string()),
            extracted_data: Some(ExtractedWorkData {
                name: "我的创作项目".to_string(),
                description: Some("一个有意义的创作项目".to_string()),
                target_hours: 50.0,
                color: Some("#9b59b6".to_string()),
                suggestions: Some(WorkSuggestions {
                    name_alternatives: Some(vec![
                        "创意项目".to_string(),
                        "我的作品".to_string(),
                    ]),
                    color_recommendations: Some(vec![
                        "#3498db".to_string(),
                        "#e67e22".to_string(),
                    ]),
                }),
            }),
            motivation_data: Some(MotivationData {
                woop: Some(WoopData {
                    wish: "完成一部高质量的小说作品".to_string(),
                    outcome: "读者会被我的故事感动，获得启发".to_string(),
                    obstacle: "可能会遇到写作瓶颈，时间不够".to_string(),
                    plan: "每天固定时间写作，寻找写作伙伴互相鼓励".to_string(),
                }),
                implementation_intentions: Some(vec![
                    ImplementationIntention {
                        if_condition: "如果到了晚上9点".to_string(),
                        then_action: "那么我就写500字".to_string(),
                        priority: 5,
                    },
                ]),
                commitments: Some(CommitmentData {
                    statement: "我承诺在3个月内完成这部小说的初稿".to_string(),
                    commitment_type: "public".to_string(),
                }),
            }),
            suggestions: Some(AISuggestions {
                quick_replies: Some(vec![
                    "这个计划很好".to_string(),
                    "我想修改承诺".to_string(),
                    "确认创建".to_string(),
                ]),
            }),
            metadata: serde_json::json!({}),
        }
    } else if message.contains("确认") {
        AIResponse {
            message: "太好了！现在让我们总结一下你的创作计划，然后就可以开始你的创作之旅了！".to_string(),
            stage: Some("confirmation".to_string()),
            extracted_data: Some(ExtractedWorkData {
                name: "我的创作项目".to_string(),
                description: Some("一个有意义的创作项目，值得投入时间和精力".to_string()),
                target_hours: 50.0,
                color: Some("#9b59b6".to_string()),
                suggestions: Some(WorkSuggestions {
                    name_alternatives: Some(vec![
                        "创意项目".to_string(),
                        "我的作品".to_string(),
                    ]),
                    color_recommendations: Some(vec![
                        "#3498db".to_string(),
                        "#e67e22".to_string(),
                    ]),
                }),
            }),
            motivation_data: Some(MotivationData {
                woop: Some(WoopData {
                    wish: "完成一部高质量的创作作品".to_string(),
                    outcome: "实现个人成长，为他人创造价值".to_string(),
                    obstacle: "时间和动力管理".to_string(),
                    plan: "制定详细计划，建立习惯".to_string(),
                }),
                implementation_intentions: Some(vec![
                    ImplementationIntention {
                        if_condition: "如果每天早上".to_string(),
                        then_action: "那么我就投入1小时".to_string(),
                        priority: 5,
                    },
                ]),
                commitments: Some(CommitmentData {
                    statement: "我承诺坚持完成这个项目".to_string(),
                    commitment_type: "public".to_string(),
                }),
            }),
            suggestions: Some(AISuggestions {
                quick_replies: Some(vec![
                    "确认创建作品".to_string(),
                    "调整信息".to_string(),
                    "重新开始".to_string(),
                ]),
            }),
            metadata: serde_json::json!({}),
        }
    } else {
        // 默认响应
        AIResponse {
            message: "听起来很有趣！能告诉我更多关于你的创作想法吗？比如你想创作什么，为什么这个项目对你很重要？".to_string(),
            stage: Some("discovery".to_string()),
            extracted_data: Some(ExtractedWorkData {
                name: "我的创作项目".to_string(),
                description: Some("一个有趣且有意义的创作项目".to_string()),
                target_hours: 40.0,
                color: Some("#3498db".to_string()),
                suggestions: Some(WorkSuggestions {
                    name_alternatives: Some(vec![
                        "创意项目".to_string(),
                        "我的作品".to_string(),
                    ]),
                    color_recommendations: Some(vec![
                        "#e67e22".to_string(),
                        "#2ecc71".to_string(),
                    ]),
                }),
            }),
            motivation_data: None,
            suggestions: Some(AISuggestions {
                quick_replies: Some(vec![
                    "我想创作一个故事".to_string(),
                    "我想开发一个工具".to_string(),
                    "我想学习新知识".to_string(),
                ]),
            }),
            metadata: serde_json::json!({}),
        }
    };

    Ok(response)
}

// 提取作品信息
#[tauri::command]
pub async fn extract_work_information(
    session_id: String,
    conversation_history: String,
) -> Result<ExtractedWorkData, String> {
    // 简单的模拟实现
    Ok(ExtractedWorkData {
        name: "我的创作项目".to_string(),
        description: Some("一个有意义的创作项目".to_string()),
        target_hours: 40.0,
        color: Some("#3498db".to_string()),
        suggestions: Some(WorkSuggestions {
            name_alternatives: Some(vec![
                "创意项目".to_string(),
                "我的作品".to_string(),
            ]),
            color_recommendations: Some(vec![
                "#e67e22".to_string(),
                "#2ecc71".to_string(),
            ]),
        }),
    })
}

// 生成动机策略
#[tauri::command]
pub async fn generate_motivation_strategies(
    session_id: String,
    work_info: String,
) -> Result<MotivationData, String> {
    // 简单的模拟实现
    Ok(MotivationData {
        woop: Some(WoopData {
            wish: "完成这个创作项目".to_string(),
            outcome: "实现个人成长，为他人创造价值".to_string(),
            obstacle: "时间和动力管理".to_string(),
            plan: "制定详细计划，建立习惯".to_string(),
        }),
        implementation_intentions: Some(vec![
            ImplementationIntention {
                if_condition: "如果每天早上".to_string(),
                then_action: "那么我就投入1小时".to_string(),
                priority: 5,
            },
        ]),
        commitments: Some(CommitmentData {
            statement: "我承诺坚持完成这个项目".to_string(),
            commitment_type: "public".to_string(),
        }),
    })
}

// 从AI创建作品
#[tauri::command]
pub async fn create_work_from_ai(
    extracted_data: serde_json::Value,
    motivation_data: Option<serde_json::Value>,
    conversation_history: serde_json::Value,
    session_id: String,
) -> Result<Work, String> {
    println!("Creating work from AI: {:?}", extracted_data);

    // 解析提取的数据
    let name = extracted_data["name"].as_str().unwrap_or("AI创建的作品").to_string();
    let description = extracted_data["description"].as_str().map(|s| s.to_string());
    let target_hours = extracted_data["target_hours"].as_f64().unwrap_or(8.0);
    let color = extracted_data["color"].as_str().map(|s| s.to_string());

    // 创建作品
    let conn = get_connection().map_err(|e| format!("Failed to get database connection: {}", e))?;

    let work_id = conn.execute(
        "INSERT INTO works (name, description, color, target_hours, is_archived, ai_created, ai_session_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            name,
            description,
            color,
            target_hours as i32,
            false,
            true,
            session_id
        ],
    ).map_err(|e| format!("Failed to create work: {}", e))?;

    let work_id = conn.last_insert_rowid();

    // 如果有动机数据，存储到数据库
    if let Some(motivation_json) = motivation_data {
        if let Ok(motivation_str) = serde_json::to_string(&motivation_json) {
            if let Some(wish) = motivation_json["woop"]["wish"].as_str() {
                let outcome = motivation_json["woop"]["outcome"].as_str().unwrap_or("");
                let obstacle = motivation_json["woop"]["obstacle"].as_str().unwrap_or("");
                let plan = motivation_json["woop"]["plan"].as_str().unwrap_or("");

                conn.execute(
                    "INSERT INTO motivation_commitments (work_id, wish, outcome, obstacle, plan) VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![work_id, wish, outcome, obstacle, plan],
                ).map_err(|e| format!("Failed to store motivation data: {}", e))?;
            }
        }
    }

    // 返回创建的作品
    let work = Work {
        id: Some(work_id),
        name,
        description,
        color,
        created_at: Some(chrono::Utc::now()),
        updated_at: Some(chrono::Utc::now()),
        target_hours: target_hours as i32,
        is_archived: false,
    };

    println!("Work created successfully: {}", work.name);
    Ok(work)
}