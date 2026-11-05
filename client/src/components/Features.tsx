import React from "react";
import {
  Bot,
  Globe,
  MessageSquare,
  Users,
  BarChart3,
  Workflow
} from "lucide-react";

const Features = () => {
  const featuresList = [
    {
      icon: Bot,
      title: "AI-Powered Chatbots",
      description: "Build intelligent chatbots that understand context and provide accurate responses using Groq, OpenAI and more."
    },
    {
      icon: Globe,
      title: "Website Widget",
      description: "Deploy a customizable chat widget on any website with a single line of code. Fully branded to match your business."
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Integration",
      description: "Connect your WhatsApp Business number to automate conversations, send campaigns, and manage contacts."
    },
    {
      icon: Users,
      title: "Team Inbox",
      description: "Collaborate with your team in a shared inbox. Assign conversations, add notes, and track response times."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track message delivery, engagement rates, and chatbot performance with real-time analytics dashboards."
    },
    {
      icon: Workflow,
      title: "Automation Flows",
      description: "Create powerful automation workflows with a visual drag-and-drop builder. No coding required."
    }
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A complete platform to build, deploy, and manage AI chatbots across multiple channels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {featuresList.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-emerald-50 p-3 rounded-xl w-fit mb-6">
                <feature.icon className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
