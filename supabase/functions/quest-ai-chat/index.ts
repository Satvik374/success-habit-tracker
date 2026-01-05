import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the Accountability Coach for Quest Tracker. Your single purpose is to help the user build discipline and consistency.

You do NOT over-motivate, sugarcoat, or comfort excuses.

## About Quest Tracker App:
- Users track daily habits (Exercise, Read, Meditate, Drink Water, etc.) 
- Users create and complete tasks/quests with XP rewards
- Completing habits gives +15 XP, tasks give 10-50 XP based on priority
- Users level up every 500 XP
- There are daily challenges and weekly challenges
- Users earn achievements for streaks, levels, perfect days, etc.

## PERSONALITY:
- Calm, direct, serious, and firm
- Speaks like a disciplined coach or mentor
- Honest, sometimes uncomfortable, never rude
- Values action over feelings
- Focused on long-term results, not short-term comfort

## CORE RULES:
1. Always prioritize accountability over encouragement.
2. If a habit is missed, call it out clearly and explain the pattern.
3. Do NOT accept excuses such as "busy", "tired", or "tomorrow".
4. Remember past failures and reference them when relevant.
5. Praise consistency only when it is earned.
6. Push the user to take action today, not someday.

## BEHAVIOR GUIDELINES:
- When progress is good: acknowledge it briefly, then raise the standard.
- When progress is poor: confront the behavior calmly and directly.
- If the user repeats mistakes: point out the repetition clearly.
- If the user avoids tasks: highlight avoidance, not lack of motivation.
- Always end responses with a clear next action.

## LANGUAGE STYLE:
- Short, sharp sentences.
- No emojis.
- No hype words.
- No generic motivational quotes.
- Use direct statements, not questions.

## EXAMPLES OF TONE:
- "You skipped this habit again. This is not a time problem. It is an avoidance pattern."
- "Consistency is improving. Do not relax yet."
- "You promised progress. Today you delivered 0%. That has consequences."
- "Motivation is irrelevant. Action is required."

## ACCOUNTABILITY FEATURES:
- Track streaks and mention when they are about to break.
- Mention exact numbers (days missed, streak length, failures).
- On weekly reviews, summarize failures honestly.
- Increase firmness if inconsistency continues.

## NEVER DO:
- Never say "It's okay" after missed habits.
- Never say "Try again tomorrow" without accountability.
- Never act like a friend or cheerleader.
- Never reset consequences emotionally.
- Never use emojis.
- Never use hype words like "amazing", "awesome", "great job".

## Your Capabilities (Tool Calling):
You can help users by calling these functions:
1. **add_task** - Add a new task for the user to complete
2. **add_habit** - Add a new habit to track
3. **edit_habit** - Modify an existing habit's name or icon
4. **delete_habit** - Remove a habit from tracking
5. **suggest_items** - Suggest tasks or habits for the user to accept or dismiss

## GOAL:
Make the user uncomfortable enough to act, but respected enough to keep coming back.
You are not here to make the user feel good.
You are here to make the user better.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentHabits } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Add context about current habits
    const habitsContext = currentHabits?.length > 0 
      ? `\n\nCurrent user habits: ${currentHabits.map((h: any) => `${h.icon} ${h.name} (id: ${h.id})`).join(", ")}`
      : "\n\nUser has no habits set up yet.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + habitsContext },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "add_task",
              description: "Add a new task/quest for the user to complete. Returns XP reward based on priority.",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string",
                    description: "The task title/description"
                  },
                  priority: { 
                    type: "string", 
                    enum: ["low", "medium", "high"],
                    description: "Task priority - determines XP reward (low=10, medium=25, high=50)"
                  }
                },
                required: ["title", "priority"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "add_habit",
              description: "Add a new daily habit for the user to track",
              parameters: {
                type: "object",
                properties: {
                  name: { 
                    type: "string",
                    description: "The habit name"
                  },
                  icon: { 
                    type: "string",
                    description: "An emoji icon representing the habit"
                  }
                },
                required: ["name", "icon"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "edit_habit",
              description: "Edit an existing habit's name or icon",
              parameters: {
                type: "object",
                properties: {
                  habitId: { 
                    type: "string",
                    description: "The ID of the habit to edit"
                  },
                  newName: { 
                    type: "string",
                    description: "The new name for the habit (optional)"
                  },
                  newIcon: { 
                    type: "string",
                    description: "The new emoji icon (optional)"
                  }
                },
                required: ["habitId"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "delete_habit",
              description: "Delete a habit from tracking",
              parameters: {
                type: "object",
                properties: {
                  habitId: { 
                    type: "string",
                    description: "The ID of the habit to delete"
                  }
                },
                required: ["habitId"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "suggest_items",
              description: "Suggest tasks or habits for the user to review and accept/dismiss. Use this when recommending things rather than adding directly.",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    description: "Array of suggested tasks or habits",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["task", "habit"],
                          description: "Whether this is a task or habit suggestion"
                        },
                        title: {
                          type: "string",
                          description: "The name/title of the task or habit"
                        },
                        icon: {
                          type: "string",
                          description: "Emoji icon (for habits)"
                        },
                        priority: {
                          type: "string",
                          enum: ["low", "medium", "high"],
                          description: "Priority level (for tasks)"
                        },
                        reason: {
                          type: "string",
                          description: "Brief reason why this is recommended"
                        }
                      },
                      required: ["type", "title", "reason"]
                    }
                  }
                },
                required: ["suggestions"]
              }
            }
          }
        ],
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    const choice = data.choices?.[0];
    const message = choice?.message;

    // Check if there are tool calls
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolCalls = message.tool_calls.map((tc: any) => ({
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      }));

      return new Response(JSON.stringify({ 
        content: message.content || "Let me help you with that!",
        toolCalls 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      content: message?.content || "I'm here to help you on your quest! What would you like to do?" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "An error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
