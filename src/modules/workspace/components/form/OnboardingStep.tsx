import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';

import { SquarePlusIcon, StepProgress } from '@/components';
import { TransactionsBoxIcon } from '@/components/icons/transactions-box-icon';

interface OnboardingStepProps {
  tabs: {
    tab: number;
    is: (value: number) => boolean;
    set: React.Dispatch<React.SetStateAction<number>>;
    length: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

const OnboardingStep = (props: OnboardingStepProps) => (
  <Center flexDirection="column" mb={5} p={6}>
    <Box m={8}>
      <Icon fontSize={100} as={TransactionsBoxIcon} />
    </Box>
    <Box mb={5}>
      <Heading fontSize="3xl">Heads up!</Heading>
    </Box>
    <Box maxW={500} mb={5}>
      <Text color="grey.400" fontSize="md" textAlign="center">
        The vault template is now ready for use whenever you need to streamline
        your workflow!
      </Text>
    </Box>
    <Box w="100%" my={5}>
      <StepProgress value={props.tabs.tab} length={props.tabs.length} />
    </Box>
    <Box mb={5} maxW={480}>
      <Text color="white" fontSize="md" textAlign="start">
        Workspaces are shared spaces that allow multiple people to access the
        same vaults and address book. Within a workspace, you can assign members
        different levels of permission, including:
      </Text>
    </Box>
    <VStack mb={5}>
      <HStack>
        <Box w="100%" maxW="90px" mr={3}>
          <Badge justifyContent="center" px={7} variant="success">
            Admin
          </Badge>
        </Box>
        <Text color="grey.200" fontSize="md">
          Manage members, create new vaults, create transaction and access
          everything.
        </Text>
      </HStack>
      <HStack>
        <Box w="100%" maxW="90px" mr={3}>
          <Badge justifyContent="center" px={7} variant="yellow">
            Manager
          </Badge>
        </Box>

        <Text color="grey.200" fontSize="md">
          Can create new vaults, create transaction and access all vaults in the
          workspace.
        </Text>
      </HStack>
      <HStack>
        <Box w="100%" maxW="90px" mr={3}>
          <Badge justifyContent="center" px={7} variant="blue">
            Viewer
          </Badge>
        </Box>
        <Text color="grey.200" fontSize="md">
          Can only access and view the contents of all vaults in the workspace.
        </Text>
      </HStack>
    </VStack>

    <Box mb={5} minW={500}>
      <Alert
        color="#F05D48"
        bgColor="rgba(240,93,72,0.1)"
        borderWidth={1}
        borderRadius={8}
        borderColor="rgba(7, 7, 7, 0.2)"
      >
        <Text fontSize="md" maxW={440}>
          <b>Important Note</b>: Membership in the workspace ≠ signatory rights
          in a vault. They are separate entities with separate controls.
        </Text>
      </Alert>
    </Box>
    <Divider m={4} borderColor="dark.100" />
    <HStack w="full" spacing={4} justifyContent="center">
      <Button
        _hover={{
          borderColor: 'brand.500',
          color: 'brand.500',
        }}
        w="25%"
        border="1px solid white"
        bgColor="transparent"
        variant="secondary"
        onClick={props.onCancel}
      >
        Cancel
      </Button>
      <Button
        w="70%"
        color="grey.300"
        variant="primary"
        onClick={props.onConfirm}
        leftIcon={<SquarePlusIcon fontSize={18} />}
        _hover={{
          opacity: 0.8,
        }}
      >
        Create workspace
      </Button>
    </HStack>
  </Center>
);

export { OnboardingStep };
