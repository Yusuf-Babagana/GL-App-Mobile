import { Button } from "@/components/ui/Button";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HelpSupportScreen() {
    const router = useRouter();

    const ContactMethod = ({ icon, title, subtitle, onPress, color }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm"
        >
            <View style={{ backgroundColor: color + '15' }} className="w-10 h-10 rounded-full items-center justify-center mr-4">
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base">{title}</Text>
                <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
    );

    const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
        const [isOpen, setIsOpen] = useState(false);
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsOpen(!isOpen)}
                className="bg-white p-4 rounded-xl border border-gray-100 mb-3"
            >
                <View className="flex-row justify-between items-center">
                    <Text className="text-gray-900 font-semibold text-base flex-1 mr-4">{question}</Text>
                    <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
                </View>
                {isOpen && (
                    <Text className="text-gray-600 text-sm mt-3 leading-5">
                        {answer}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper bg="bg-gray-50">
            <View className="bg-white border-b border-gray-100 px-6 pt-12 pb-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-gray-50">
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Help & Support</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>

                {/* Contact Section */}
                <Text className="text-gray-900 font-bold text-lg mb-4">Contact Us</Text>
                <ContactMethod
                    icon="mail-outline"
                    title="Email Support"
                    subtitle="support@globalink.com"
                    onPress={() => Linking.openURL('mailto:support@globalink.com')}
                    color="#6366F1"
                />
                <ContactMethod
                    icon="logo-whatsapp"
                    title="WhatsApp"
                    subtitle="Chat with our support team"
                    onPress={() => Linking.openURL('https://wa.me/2348000000000')}
                    color="#22C55E"
                />
                <ContactMethod
                    icon="call-outline"
                    title="Call Us"
                    subtitle="+234 800 000 0000"
                    onPress={() => Linking.openURL('tel:+2348000000000')}
                    color="#3B82F6"
                />

                {/* FAQ Section */}
                <Text className="text-gray-900 font-bold text-lg mb-4 mt-8">Frequently Asked Questions</Text>
                <FAQItem
                    question="How do I track my order?"
                    answer="You can track your order by navigating to the 'My Orders' section in your account. Select an active order to view its current status and tracking details."
                />
                <FAQItem
                    question="How do I reset my password?"
                    answer="Go to the login screen and tap on 'Forgot Password?'. Follow the instructions sent to your email to reset your password."
                />
                <FAQItem
                    question="Can I change my delivery address?"
                    answer="Yes, you can change your delivery address before the order is dispatched. Go to 'My Orders', select the order, and look for the 'Edit Address' option if available, or contact support immediately."
                />
                <FAQItem
                    question="What payment methods are accepted?"
                    answer="We accept various payment methods including credit/debit cards, bank transfers, and mobile money. You can manage your payment methods in 'My Wallet'."
                />

                {/* Report Issue Button */}
                <View className="mt-8">
                    <Button
                        title="Report an Issue"
                        onPress={() => router.push("/help/report-issue" as any)} // Assuming this route might exist or can be a placeholder
                        variant="secondary"
                        icon={<Ionicons name="bug-outline" size={20} color="#1F2937" />}
                    />
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
}
