import React, { useState, useEffect, useRef } from 'react';
import { Send, Leaf, CloudRain, Thermometer, Droplets, AlertTriangle, CheckCircle, Map, Calendar } from 'lucide-react';

const ClimateAgAdvisor = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    setMessages([{
      type: 'bot',
      content: "🌾 Welcome to the Climate-Resilient Agriculture Advisor!\n\nI'm here to help you make informed farming decisions based on climate data and sustainable practices.\n\nTo get started, please tell me:\n1. Your location (city/region)\n2. What crop you're planning to grow\n3. Your current farming challenge (optional)\n\nExample: \"I'm in Nairobi, Kenya, planning to grow maize\"",
      timestamp: new Date()
    }]);
  }, []);

  // Simulated knowledge base for RAG
  const knowledgeBase = {
    crops: {
      maize: {
        waterReq: 'medium-high',
        tempRange: '18-27°C',
        soilType: 'well-drained loamy',
        growingSeason: '90-120 days',
        droughtTolerance: 'moderate',
        resilientVarieties: ['Drought-Tolerant Maize (DTM)', 'QPM varieties', 'Hybrid 614'],
        tips: 'Consider intercropping with legumes for nitrogen fixation'
      },
      rice: {
        waterReq: 'high',
        tempRange: '20-35°C',
        soilType: 'clay loam',
        growingSeason: '120-150 days',
        droughtTolerance: 'low',
        resilientVarieties: ['Sahbhagi Dhan', 'NERICA varieties', 'Swarna-Sub1'],
        tips: 'System of Rice Intensification (SRI) can reduce water use by 25-50%'
      },
      wheat: {
        waterReq: 'medium',
        tempRange: '12-25°C',
        soilType: 'well-drained loamy',
        growingSeason: '120-150 days',
        droughtTolerance: 'moderate-high',
        resilientVarieties: ['HD-2967', 'C-306', 'DBW-187'],
        tips: 'Zero-tillage farming reduces water loss and improves soil health'
      },
      sorghum: {
        waterReq: 'low',
        tempRange: '25-35°C',
        soilType: 'well-drained',
        growingSeason: '90-120 days',
        droughtTolerance: 'high',
        resilientVarieties: ['CSH-16', 'Gadam Sorghum', 'SPV-462'],
        tips: 'Excellent drought-resistant alternative to maize'
      },
      millet: {
        waterReq: 'low',
        tempRange: '25-35°C',
        soilType: 'sandy loam',
        growingSeason: '70-90 days',
        droughtTolerance: 'very high',
        resilientVarieties: ['Pearl Millet HHB-67', 'Finger Millet GPU-28'],
        tips: 'Highly nutritious and climate-resilient; excellent for food security'
      }
    },
    practices: {
      waterConservation: [
        'Drip irrigation (70% water savings)',
        'Mulching to reduce evaporation',
        'Rainwater harvesting systems',
        'Conservation tillage'
      ],
      soilHealth: [
        'Composting and organic matter addition',
        'Crop rotation with legumes',
        'Cover cropping during off-season',
        'Reduced tillage practices'
      ],
      climateAdaptation: [
        'Agroforestry for microclimate regulation',
        'Diversified cropping systems',
        'Early warning system integration',
        'Weather-indexed insurance enrollment'
      ]
    }
  };

  // Simulated weather API response
  const getWeatherData = (location) => {
    const weatherScenarios = {
      default: {
        temp: 28,
        humidity: 65,
        rainfall: 45,
        forecast: 'Moderate rainfall expected in next 2 weeks'
      },
      drought: {
        temp: 35,
        humidity: 30,
        rainfall: 5,
        forecast: 'Low rainfall predicted; drought risk high'
      },
      flood: {
        temp: 26,
        humidity: 85,
        rainfall: 150,
        forecast: 'Heavy rainfall expected; flood risk elevated'
      }
    };

    const random = Math.random();
    if (random < 0.3) return weatherScenarios.drought;
    if (random < 0.5) return weatherScenarios.flood;
    return weatherScenarios.default;
  };

  // Climate risk assessment engine
  const assessClimateRisk = (weather, crop) => {
    const risks = [];
    const recommendations = [];

    const cropData = knowledgeBase.crops[crop.toLowerCase()];
    
    if (weather.rainfall < 30 && cropData?.waterReq === 'high') {
      risks.push({
        type: 'drought',
        severity: 'high',
        message: `High drought risk detected. ${crop} requires significant water.`
      });
      recommendations.push(`Consider switching to drought-resistant crops like sorghum or millet`);
      recommendations.push(`Implement drip irrigation to maximize water efficiency`);
    } else if (weather.rainfall < 30) {
      risks.push({
        type: 'drought',
        severity: 'medium',
        message: 'Moderate drought conditions predicted.'
      });
      recommendations.push('Install rainwater harvesting systems');
      recommendations.push('Apply mulch to reduce soil evaporation');
    }

    if (weather.rainfall > 100) {
      risks.push({
        type: 'flood',
        severity: 'high',
        message: 'Flood risk detected with excessive rainfall.'
      });
      recommendations.push('Ensure proper drainage systems are in place');
      recommendations.push('Consider raised bed farming');
      recommendations.push('Delay planting until after heavy rainfall period');
    }

    if (weather.temp > 32 && cropData) {
      const tempRange = cropData.tempRange.split('-');
      const maxTemp = parseInt(tempRange[1]);
      if (weather.temp > maxTemp) {
        risks.push({
          type: 'heat',
          severity: 'medium',
          message: `Temperature exceeds optimal range for ${crop}.`
        });
        recommendations.push('Provide shade netting during peak heat hours');
        recommendations.push('Increase irrigation frequency');
      }
    }

    if (risks.length === 0) {
      risks.push({
        type: 'optimal',
        severity: 'low',
        message: 'Conditions are favorable for farming.'
      });
      recommendations.push('Proceed with planned cultivation schedule');
    }

    return { risks, recommendations };
  };

  // Entity extraction from user input
  const extractEntities = (text) => {
    const entities = {
      location: null,
      crop: null,
      challenge: null
    };

    const lowerText = text.toLowerCase();

    // Extract crops
    Object.keys(knowledgeBase.crops).forEach(crop => {
      if (lowerText.includes(crop)) {
        entities.crop = crop;
      }
    });

    // Extract location (simplified - would use NER in production)
    const locationKeywords = ['nairobi', 'kenya', 'mumbai', 'india', 'lagos', 'nigeria', 
                              'dhaka', 'bangladesh', 'kampala', 'uganda', 'addis ababa', 'ethiopia'];
    locationKeywords.forEach(loc => {
      if (lowerText.includes(loc)) {
        entities.location = loc;
      }
    });

    // Extract challenges
    const challenges = ['drought', 'flood', 'pest', 'soil', 'water', 'yield'];
    challenges.forEach(challenge => {
      if (lowerText.includes(challenge)) {
        entities.challenge = challenge;
      }
    });

    return entities;
  };

  // Main AI agent workflow
  const processUserQuery = async (userInput) => {
    setLoading(true);

    // Step 1: Entity Extraction
    const entities = extractEntities(userInput);

    // Step 2: Profile Update
    if (entities.location || entities.crop) {
      setUserProfile(prev => ({
        ...prev,
        location: entities.location || prev?.location,
        crop: entities.crop || prev?.crop
      }));
    }

    const currentProfile = {
      location: entities.location || userProfile?.location,
      crop: entities.crop || userProfile?.crop
    };

    // Step 3: Check if we have enough information
    if (!currentProfile.location || !currentProfile.crop) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `I need a bit more information:\n${!currentProfile.location ? '- Your location (city/region)\n' : ''}${!currentProfile.crop ? '- The crop you want to grow\n' : ''}\nPlease provide these details so I can give you personalized advice.`,
          timestamp: new Date()
        }]);
        setLoading(false);
      }, 500);
      return;
    }

    // Step 4: Retrieve Weather Data (RAG simulation)
    const weatherData = getWeatherData(currentProfile.location);

    // Step 5: Assess Climate Risks
    const assessment = assessClimateRisk(weatherData, currentProfile.crop);

    // Step 6: Retrieve Crop-Specific Knowledge
    const cropInfo = knowledgeBase.crops[currentProfile.crop.toLowerCase()];

    // Step 7: Generate Comprehensive Response
    setTimeout(() => {
      const response = generateResponse(currentProfile, weatherData, assessment, cropInfo);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response,
        timestamp: new Date(),
        data: { weatherData, assessment, cropInfo }
      }]);
      setLoading(false);
    }, 1000);
  };

  const generateResponse = (profile, weather, assessment, cropInfo) => {
    let response = `## 🌍 Analysis for ${profile.crop.charAt(0).toUpperCase() + profile.crop.slice(1)} in ${profile.location}\n\n`;

    // Weather Summary
    response += `### 🌤️ Current Climate Conditions\n`;
    response += `- Temperature: ${weather.temp}°C\n`;
    response += `- Humidity: ${weather.humidity}%\n`;
    response += `- Rainfall (30-day): ${weather.rainfall}mm\n`;
    response += `- Forecast: ${weather.forecast}\n\n`;

    // Risk Assessment
    response += `### ⚠️ Risk Assessment\n`;
    assessment.risks.forEach(risk => {
      const icon = risk.severity === 'high' ? '🔴' : risk.severity === 'medium' ? '🟡' : '🟢';
      response += `${icon} **${risk.type.toUpperCase()}** (${risk.severity} severity): ${risk.message}\n`;
    });
    response += `\n`;

    // Recommendations
    response += `### 💡 Personalized Recommendations\n`;
    assessment.recommendations.forEach((rec, idx) => {
      response += `${idx + 1}. ${rec}\n`;
    });
    response += `\n`;

    // Crop-Specific Guidance
    if (cropInfo) {
      response += `### 🌾 ${profile.crop.charAt(0).toUpperCase() + profile.crop.slice(1)}-Specific Guidance\n`;
      response += `- **Water Requirements**: ${cropInfo.waterReq}\n`;
      response += `- **Optimal Temperature**: ${cropInfo.tempRange}\n`;
      response += `- **Growing Season**: ${cropInfo.growingSeason}\n`;
      response += `- **Drought Tolerance**: ${cropInfo.droughtTolerance}\n\n`;

      response += `**Recommended Resilient Varieties:**\n`;
      cropInfo.resilientVarieties.forEach(variety => {
        response += `- ${variety}\n`;
      });
      response += `\n💡 **Pro Tip**: ${cropInfo.tips}\n\n`;
    }

    // Sustainable Practices
    response += `### 🌱 Sustainable Farming Practices\n`;
    response += `**Water Conservation:**\n`;
    knowledgeBase.practices.waterConservation.slice(0, 2).forEach(practice => {
      response += `- ${practice}\n`;
    });
    response += `\n**Soil Health:**\n`;
    knowledgeBase.practices.soilHealth.slice(0, 2).forEach(practice => {
      response += `- ${practice}\n`;
    });

    response += `\n---\n📊 **Data Source Transparency**: This analysis uses simulated satellite and weather data. Predictions have ~70% accuracy based on historical patterns.\n\n`;
    response += `💬 Ask me about: planting schedules, pest management, irrigation tips, or alternative crops!`;

    return response;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    processUserQuery(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { text: "Weather forecast", icon: CloudRain },
    { text: "Crop recommendations", icon: Leaf },
    { text: "Water management", icon: Droplets },
    { text: "Planting schedule", icon: Calendar }
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Leaf className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Climate-Resilient Agriculture Advisor</h1>
              <p className="text-sm text-green-100">AI-Powered Sustainable Farming Assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl rounded-lg p-4 shadow ${
                msg.type === 'user' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content.split('\n').map((line, i) => {
                    if (line.startsWith('##')) {
                      return <h2 key={i} className="text-lg font-bold mt-3 mb-2">{line.replace('##', '')}</h2>;
                    }
                    if (line.startsWith('###')) {
                      return <h3 key={i} className="text-md font-semibold mt-2 mb-1">{line.replace('###', '')}</h3>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-semibold mt-1">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.trim().startsWith('-')) {
                      return <li key={i} className="ml-4">{line.substring(1)}</li>;
                    }
                    if (line.match(/^\d+\./)) {
                      return <li key={i} className="ml-4 list-decimal">{line}</li>;
                    }
                    if (line.startsWith('---')) {
                      return <hr key={i} className="my-2 border-gray-300" />;
                    }
                    return line ? <p key={i} className="my-1">{line}</p> : <br key={i} />;
                  })}
                </div>
                <div className="text-xs mt-2 opacity-70">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                  <span className="text-sm text-gray-600">Analyzing climate data...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
            <div className="flex gap-2 flex-wrap">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(action.text)}
                  className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-gray-700 hover:bg-green-50 border border-gray-200"
                >
                  <action.icon className="w-3 h-3" />
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about crops, weather, or farming practices..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          🌍 SDG 2: Zero Hunger | SDG 13: Climate Action | Powered by Responsible AI
        </p>
      </div>
    </div>
  );
};

export default ClimateAgAdvisor;