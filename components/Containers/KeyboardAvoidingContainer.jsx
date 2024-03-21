import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

export default function KeyboardAvoidingContainer ({ children, style }) {
  const headerHeight = useHeaderHeight();

  return (
    <SafeAreaView >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[style]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};