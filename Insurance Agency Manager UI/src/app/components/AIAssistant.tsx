import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { X, Send, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Portfolio Assistant. I can help you with:\n\n• Explaining agency performance metrics\n• Drafting meeting narratives\n• Suggesting next best actions\n• Recommending daily visit plans\n• Analyzing clustering strategies\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      let response = "";
      
      if (input.toLowerCase().includes("premium insurance") || input.toLowerCase().includes("ag001")) {
        response = `Analysis of Premium Insurance Group (AG001):

**Performance Summary:**
• Renewal Rate: 62% (vs portfolio avg 71%) - 9 points below benchmark ⚠️
• Claims Ratio: 72% (vs portfolio avg 68%) - 4 points above benchmark
• Health Score: 68/100
• Premiums Written: $2.5M
• Best Branch: Home (+12.3% YoY)

**Key Concerns:**
1. RENEWAL RISK FLAG - This agency needs immediate attention for customer retention
2. Claims ratio elevated - Review underwriting quality and claims management

**Recommended Actions:**
1. Schedule urgent meeting to address renewal concerns
2. Review recent cancellations and non-renewals
3. Discuss claims management strategies
4. Leverage home branch success for cross-sell opportunities

Would you like me to generate a meeting preparation narrative for this agency?`;
      } else if (input.toLowerCase().includes("meeting") || input.toLowerCase().includes("narrative")) {
        response = "I can generate meeting narratives with the following information:\n\n• Opening context and relationship notes\n• Performance metrics with benchmark comparisons\n• Risk factors requiring discussion\n• Growth opportunities by branch\n• Suggested questions to ask\n• Proposed commitments and next steps\n\nWhich agency would you like to prepare for?";
      } else if (input.toLowerCase().includes("route") || input.toLowerCase().includes("plan")) {
        response = "For optimal route planning, I recommend:\n\n1. **Today's Top 3 Priorities:**\n   • Shield Insurance (AG004) - Renewal risk, Financial District\n   • Premium Insurance (AG001) - Claims concerns, Manhattan\n   • Secure Future Agency (AG008) - Relationship check-in, Financial District\n\n2. **Estimated Route:**\n   • Start: 9:00 AM - Shield Insurance (Financial District)\n   • 10:30 AM - Premium Insurance (Manhattan)\n   • 2:00 PM - Secure Future (Financial District)\n   • Total Travel: ~45 minutes\n\n3. **Clustering Benefits:**\n   Financial District has 2 high-priority agencies that can be visited efficiently.\n\nWould you like me to add these to your daily plan?";
      } else if (input.toLowerCase().includes("risk") || input.toLowerCase().includes("renewal")) {
        response = `**Portfolio Renewal Risk Analysis:**

Agencies flagged for renewal risk:
1. Premium Insurance (AG001) - 62% renewal rate
2. Shield Insurance (AG004) - 58% renewal rate

**Common Factors:**
• Both are Tier A agencies (high value)
• Both have claims ratios above benchmark
• Combined represent $5.7M in premiums

**Recommended Strategy:**
1. Prioritize these visits this week
2. Prepare retention incentive packages
3. Review competitive positioning
4. Conduct customer satisfaction surveys

**Estimated Impact:**
Addressing these risks could protect $5.7M in annual premiums.`;
      } else {
        response = "I understand you're asking about: \"" + input + "\"\n\nI can help with:\n• Agency-specific performance analysis\n• Meeting preparation and narratives\n• Route optimization recommendations\n• Risk assessment and prioritization\n• Growth opportunity identification\n\nCould you provide more details or ask about a specific agency?";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl rounded-lg overflow-hidden z-50">
      <Card className="h-full flex flex-col">
        <CardHeader className="bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <CardTitle className="text-white">AI Assistant</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <CardContent className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            AI responses are generated based on your portfolio data
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
