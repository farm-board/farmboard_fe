import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function KeyboardAvoidingContainer ({ children, style }) {
  const headerHeight = useHeaderHeight();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={style}
        extraHeight={120} // or more, depending on how far you need to push content
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
          {children}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};