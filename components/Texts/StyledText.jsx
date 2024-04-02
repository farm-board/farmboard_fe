import { Text } from "react-native";
import { colors } from "./../../config/theme";

const StyledText = ({ children, small, big, bold, style, tanColor, ...props }) => {
  return (
    <Text
      style={[
        {
          color: tanColor ? colors.highlight : colors?.primary,
          fontSize: small ? 13 : big ? 20 : 15,
          fontWeight: big || bold ? "bold" : "normal",
          paddingBottom: 2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default StyledText;