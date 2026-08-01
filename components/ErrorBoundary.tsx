import React, { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught render error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            An unexpected error occurred. Please try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#329629",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
