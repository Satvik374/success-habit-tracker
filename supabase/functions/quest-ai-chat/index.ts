import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Quest AI, the helpful assistant for Quest Tracker - a gamified habit and task tracking app. You help users level up their lives through productivity!

## About Quest Tracker App:
- Users track daily habits (Exercise, Read, Meditate, Drink Water, etc.) 
- Users create and complete tasks/quests with XP rewards
- Completing habits gives +15 XP, tasks give 10-50 XP based on priority
- Users level up every 500 XP
- There are daily challenges (complete 3 tasks, 2 habits) and weekly challenges
- Users earn achievements for streaks, levels, perfect days, etc.
- The app has customizable aura themes, sound effects, and confetti celebrations
- Settings allow toggling sounds and confetti on/off

## Your Capabilities (Tool Calling):
You can help users by calling these functions:
1. **add_task** - Add a new quest/task for the user to complete
2. **add_habit** - Add a new habit to track
3. **edit_habit** - Modify an existing habit's name or icon
4. **delete_habit** - Remove a habit from tracking
5. **suggest_items** - Suggest tasks or habits for the user to accept or dismiss (use this when giving recommendations)

## Personality:
- Be encouraging and motivational like a game companion
- Use gaming terminology (quests, XP, level up, achievements)
- Keep responses concise but helpful
- When users ask for suggestions or recommendations, use suggest_items to show clickable cards
- When users explicitly ask to add tasks/habits, add them directly
- Celebrate user progress and encourage them

## Guidelines:
- For task priority, infer from context: urgent/important = high, normal = medium, minor = low
- Suggest good habit icons using emojis
- When editing/deleting, ask for clarification if the habit name is ambiguous
- When giving suggestions (e.g. "suggest some habits", "what tasks should I do"), use suggest_items tool
- Always be positive and supportive!`;

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
