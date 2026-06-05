import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface DataPlanListProps {
    plans: any[];
    selectedPlan: any;
    onSelectPlan: (plan: any) => void;
    loading: boolean;
}

export default function DataPlanList({ plans, selectedPlan, onSelectPlan, loading }: DataPlanListProps) {
    return (
        <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-500 mb-2">SELECT DATA BUNDLE</Text>
            <View className="bg-gray-50 rounded-xl border border-gray-100">
                {loading ? (
                    <ActivityIndicator size="small" color="#329629" className="p-4" />
                ) : (
                    <Picker
                        selectedValue={selectedPlan}
                        onValueChange={(itemValue) => onSelectPlan(itemValue)}
                    >
                        {plans.length > 0 ? (
                            plans.map((plan, index) => (
                                <Picker.Item
                                    // Use ID for Nellobyte or variation_code for legacy
                                    key={plan.ID || plan.variation_code || index.toString()}
                                    label={`${plan.name || plan.Name} - ₦${plan.variation_amount || plan.Amount}`}
                                    value={plan}
                                />
                            ))
                        ) : (
                            <Picker.Item label="No plans available" value={null} />
                        )}
                    </Picker>
                )}
            </View>
        </View>
    );
}
