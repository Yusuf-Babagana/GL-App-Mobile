import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Smartphone } from 'lucide-react-native';

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
        <View className="flex-row justify-between px-2 mb-8">
            {NETWORKS.map((net) => {
                const isSelected = selectedNetwork === net.id;
                return (
                    <TouchableOpacity
                        key={net.id}
                        activeOpacity={0.8}
                        onPress={() => onSelectNetwork(net.id)}
                        className="items-center"
                    >
                        <View
                            style={{
                                width: 66,
                                height: 66,
                                borderRadius: 33,
                                backgroundColor: net.color,
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: [{ scale: isSelected ? 1.08 : 1 }],
                                borderWidth: isSelected ? 3 : 0,
                                borderColor: '#329629',
                                shadowColor: isSelected ? '#329629' : '#000',
                                shadowOffset: { width: 0, height: isSelected ? 5 : 2 },
                                shadowOpacity: isSelected ? 0.5 : 0.12,
                                shadowRadius: isSelected ? 10 : 4,
                                elevation: isSelected ? 8 : 2,
                            }}
                        >
                            <Smartphone size={26} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                        <Text
                            className={`mt-2 text-[11px] ${isSelected ? 'text-primary font-black' : 'text-gray-400 font-bold'}`}
                        >
                            {net.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
