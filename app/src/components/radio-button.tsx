import { Box, HStack, Icon, Text, useRadio } from "@chakra-ui/react";
import { MdCheck } from "react-icons/md";

export function RadioButton(props: any) {
  const { getInputProps, getRadioProps, state } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="full"
        boxShadow="md"
        bg="base.light"
        _checked={{
          bg: "background.neutral",
          color: "interactive.secondary",
          borderColor: "background.neutral",
        }}
        _focus={{
          borderColor: "interactive.secondary",
        }}
        px={5}
        py={3}
        minHeight={12}
      >
        <HStack>
          {state.isChecked && <Icon as={MdCheck} boxSize={5} mt={0.5} />}
          <Text className="text-sm">{props.children}</Text>
        </HStack>
      </Box>
    </Box>
  );
}
