import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { useTranslatedText } from "@/components/TranslatedText";

export default function About() {
  const { text: aboutTitleText } = useTranslatedText("About 2-1-1");
  const { text: aboutSubtitleText } = useTranslatedText("Connecting people with the resources they need, when they need them most.");
  const { text: missionTitleText } = useTranslatedText("Our Mission");
  const { text: missionDescText } = useTranslatedText("2-1-1 is a comprehensive information and referral service that connects people with local resources in their community. We provide access to essential services including housing assistance, food programs, healthcare, employment resources, and emergency support - all available 24/7 by simply dialing 2-1-1.");
  const { text: servicesTitleText } = useTranslatedText("What We Offer");
  const { text: essentialServicesText } = useTranslatedText("Essential Services");
  const { text: supportServicesText } = useTranslatedText("Support Services");
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{aboutTitleText}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {aboutSubtitleText}
          </p>
        </div>

        {/* Mission Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">{missionTitleText}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {missionDescText}
            </p>
          </CardContent>
        </Card>

        {/* Services Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">{servicesTitleText}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{essentialServicesText}</h4>
                <ul className="text-gray-700 space-y-1">
                  <li>• Housing & Shelter Assistance</li>
                  <li>• Food & Nutrition Programs</li>
                  <li>• Healthcare & Mental Health</li>
                  <li>• Employment & Training</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{supportServicesText}</h4>
                <ul className="text-gray-700 space-y-1">
                  <li>• Legal Assistance</li>
                  <li>• Transportation Services</li>
                  <li>• Child & Family Support</li>
                  <li>• Emergency Financial Aid</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">Get Help Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Call 2-1-1</p>
                    <a 
                      href="tel:18004001572" 
                      className="text-blue-600 hover:underline"
                    >
                      1-800-400-1572
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Online</p>
                    <a 
                      href="https://www.211.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      www.211.org
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Available 24/7</h4>
                  <p className="text-gray-700">
                    Our trained specialists are available around the clock to help you 
                    find the resources you need in your community.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Multilingual Support</h4>
                  <p className="text-gray-700">
                    Services available in multiple languages to serve diverse communities.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium">
            <strong>Emergency?</strong> Call 9-1-1 for immediate emergency assistance.
          </p>
          <p className="text-red-700 text-sm mt-1">
            2-1-1 is for information and referrals to community resources, not emergency services.
          </p>
        </div>
      </div>
    </div>
  );
}