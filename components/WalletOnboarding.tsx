import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { marketAPI } from '../lib/marketApi';

interface Props {
  onComplete: () => void;
}

const WalletOnboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<'bvn' | 'pin' | 'confirm'>('bvn');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ bvn: '', pin: '', confirmPin: '' });

  const handleNext = async () => {
    if (step === 'bvn') {
      if (data.bvn.length !== 11) {
        return Alert.alert("Invalid BVN", "BVN must be exactly 11 digits.");
      }
      setLoading(true);
      try {
        await marketAPI.updateBVN(data.bvn);
        // Backend now returns 200 and triggers virtual account generation
        setStep('pin');
      } catch (e: any) {
        Alert.alert("Verification Error", e.error || "Could not verify BVN. Please try again.");
      } finally {
        setLoading(false);
      }
    } 
    
    else if (step === 'pin') {
      if (data.pin.length !== 4) {
        return Alert.alert("Invalid PIN", "Please set a 4-digit security PIN.");
      }
      setStep('confirm');
    } 
    
    else if (step === 'confirm') {
      if (data.pin !== data.confirmPin) {
        Alert.alert("Mismatch", "PINs do not match. Please start over.");
        setData({ ...data, pin: '', confirmPin: '' });
        return setStep('pin');
      }
      
      setLoading(true);
      try {
        await marketAPI.setTransactionPin(data.pin);
        Alert.alert("Success", "Wallet setup complete!");
        onComplete(); // This refreshes the parent WalletScreen
      } catch (e: any) {
        Alert.alert("Security Error", e.error || "Failed to set PIN.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 'bvn' ? "Identity Verification" : step === 'pin' ? "Set Wallet PIN" : "Confirm Wallet PIN"}
      </Text>
      <Text style={styles.subtitle}>
        {step === 'bvn' ? "Enter your 11-digit BVN to generate your bank accounts." : "This PIN will be required for all future transactions."}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder={step === 'bvn' ? "00000000000" : "****"}
        keyboardType="numeric"
        maxLength={step === 'bvn' ? 11 : 4}
        secureTextEntry={step !== 'bvn'}
        value={step === 'bvn' ? data.bvn : step === 'pin' ? data.pin : data.confirmPin}
        onChangeText={(text) => {
            const clean = text.replace(/[^0-9]/g, '');
            if(step === 'bvn') setData({...data, bvn: clean});
            else if(step === 'pin') setData({...data, pin: clean});
            else setData({...data, confirmPin: clean});
        }}
      />

      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Continue</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { padding: 25, flex: 1, justifyContent: 'center', backgroundColor: '#FFF' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#1A1A1A' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center', lineHeight: 20 },
    input: { backgroundColor: '#F8F8F8', padding: 18, borderRadius: 12, fontSize: 20, textAlign: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#EEE' },
    button: { backgroundColor: '#4ADE80', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2 },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default WalletOnboarding;
