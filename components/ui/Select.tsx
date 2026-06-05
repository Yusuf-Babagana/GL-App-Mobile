import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  placeholder: string;
  options: Option[];
  onValueChange: (value: string) => void;
  value?: string;
}

export const Select = ({ label, placeholder, options, onValueChange, value }: SelectProps) => {
  const [visible, setVisible] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <View className="mb-6">
      <Text className="text-gray-700 font-bold text-xs mb-2">{label}</Text>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="border border-gray-300 rounded-xl p-4 flex-row justify-between items-center bg-white"
      >
        <Text className={selectedOption ? "text-black font-bold text-sm" : "text-gray-400 font-bold text-sm"}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="fade" transparent={true}>
        <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setVisible(false)}
            className="flex-1 justify-end bg-black/30"
        >
          <View className="bg-white rounded-t-[40px] p-8 pb-12 max-h-[60%]" onStartShouldSetResponder={() => true}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-black">{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text className="text-blue-600 font-black text-sm">Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(item.value);
                    setVisible(false);
                  }}
                  className="flex-row justify-between items-center py-5 border-b border-gray-50"
                >
                  <Text className={`text-base ${value === item.value ? 'font-black text-blue-600' : 'font-bold text-gray-700'}`}>
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <View className="bg-blue-50 p-1.5 rounded-full">
                        <Check size={16} color="#2563EB" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
