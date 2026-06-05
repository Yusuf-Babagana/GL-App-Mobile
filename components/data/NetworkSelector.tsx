import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const NETWORKS = [
    { id: 'mtn-data', name: 'MTN', color: '#FFCC00' },
    { id: 'glo-data', name: 'Glo', color: '#008444' },
    { id: 'airtel-data', name: 'Airtel', color: '#FF0000' },
    { id: '9mobile-data', name: '9mobile', color: '#006139' },
];

interface NetworkSelectorProps {
    selectedNetwork: string;
    onSelectNetwork: (networkId: string) => void;
}

export default function NetworkSelector({ selectedNetwork, onSelectNetwork }: NetworkSelectorProps) {
    return (
        <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-500 mb-3">SELECT NETWORK</Text>
            <View className="flex-row justify-between">
                {NETWORKS.map((net) => (
                    <TouchableOpacity
                        key={net.id}
                        onPress={() => onSelectNetwork(net.id)}
                        className={`p-3 rounded-xl border-2 ${selectedNetwork === net.id ? 'border-primary bg-primary-container' : 'border-gray-100'}`}
                    >
                        <View style={{ backgroundColor: net.color }} className="w-12 h-12 rounded-full items-center justify-center mb-1">
                            <Text className="text-white font-bold text-[10px]">{net.name}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
