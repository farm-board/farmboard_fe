import { Text } from "react-native";
import { colors } from "./../../config/theme";

const StyledText = ({ children, small, big, bold, style, ...props }) => {
  return (
    <Text
      style={[
        {
          color: colors?.primary,
          fontSize: small ? 13 : big ? 24 : 15,
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