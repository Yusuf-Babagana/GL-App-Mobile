import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ChevronLeft, Shirt, Monitor, Smartphone, Sofa, Baby, ToyBrick, Trophy, Utensils, ChefHat, Home, Car, Sparkles, Building2, BookOpen, Wrench, Sprout } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

// 📂 Category Data Mapping
const CATEGORIES = [
    { id: 'fashion', name: 'Fashion', icon: Shirt },
    { id: 'electronics', name: 'Electronics', icon: Monitor },
    { id: 'phones', name: 'Phones & Tablets', icon: Smartphone },
    { id: 'furniture', name: 'Furnitures', icon: Sofa },
    { id: 'kids_wears', name: 'Kids Wears', icon: Baby },
    { id: 'kids_toys', name: 'Kids Toys', icon: ToyBrick },
    { id: 'sport', name: 'Sport', icon: Trophy },
    { id: 'food', name: 'Food', icon: Utensils },
    { id: 'kitchen', name: 'Kitchen Utensils', icon: ChefHat },
    { id: 'home', name: 'Home Appliances', icon: Home },
    { id: 'vehicles', name: 'Vehicles', icon: Car },
    { id: 'health', name: 'Health & Beauty', icon: Sparkles },
    { id: 'building', name: 'Building & Plumbing', icon: Building2 },
    { id: 'books', name: 'Books', icon: BookOpen },
    { id: 'tools', name: 'Tools & Accessories', icon: Wrench },
    { id: 'agriculture', name: 'Agriculture', icon: Sprout },
];

export default function CategorySelection() {
    const router = useRouter();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const toggleCategory = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(item => item !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6">
                {/* Back Button */}
                <TouchableOpacity onPress={() => router.back()} className="mt-4 mb-6">
                    <ChevronLeft size={28} color="#000000" />
                </TouchableOpacity>

                {/* Header Section */}
                <View className="mb-8">
                    <Text className="text-3xl font-black text-black mb-2">Personalise your</Text>
                    <Text className="text-3xl font-black text-black mb-4">experience</Text>
                    <Text className="text-gray-400 text-sm font-medium">
                        what kind of products do you want to sell
                    </Text>
                </View>

                {/* Categories Grid */}
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <View className="flex-row flex-wrap justify-between pb-10">
                        {CATEGORIES.map((item) => {
                            const Icon = item.icon;
                            const isSelected = selectedCategories.includes(item.id);
                            
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => toggleCategory(item.id)}
                                    className={`w-[23%] aspect-square items-center justify-center rounded-2xl mb-6 ${
                                        isSelected ? 'bg-green-600' : 'bg-green-50'
                                    }`}
                                >
                                    <Icon 
                                        size={28} 
                                        color={isSelected ? "#FFFFFF" : "#2563EB"} 
                                        strokeWidth={2.5}
                                    />
                                    <Text 
                                        className={`text-[9px] font-black text-center mt-2 px-1 leading-tight ${
                                            isSelected ? 'text-white' : 'text-gray-600'
                                        }`}
                                    >
                                        {item.name}
                                    </Text>
                                    
                                    {/* Small Checkmark if selected */}
                                    {isSelected && (
                                        <View className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-green-600">
                                            <View className="bg-green-600 rounded-full w-3 h-3 items-center justify-center">
                                                <Text className="text-[6px] text-white font-bold">✓</Text>
                                            </View>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Next Button */}
                <View className="py-6">
                    <TouchableOpacity
                        disabled={selectedCategories.length === 0}
                        onPress={() => router.push('/merchant/personal-info')}
                        className={`w-full py-5 rounded-2xl items-center ${
                            selectedCategories.length > 0 ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                    >
                        <Text className={`text-lg font-black ${
                            selectedCategories.length > 0 ? 'text-white' : 'text-gray-400'
                        }`}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
