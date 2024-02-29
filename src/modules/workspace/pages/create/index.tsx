import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { Controller } from 'react-hook-form';

import {
  Dialog,
  FeedbackSuccess,
  SquarePlusIcon,
  StepProgress,
} from '@/components';

import { OnboardingStep } from '../../components';
import {
  CreateWorkspaceTabState,
  UseCreateWorkspace,
  useCreateWorkspace,
} from '../../hooks/create';

const CreateWorkspaceForm = ({
  form,
}: {
  form: UseCreateWorkspace['form'];
}) => (
  <VStack spacing={6}>
    <Controller
      control={form.control}
      name="name"
      render={({ field, fieldState }) => (
        <FormControl isInvalid={fieldState.invalid}>
          <Input
            value={field.value}
            onChange={field.onChange}
            placeholder=" "
          />
          <FormLabel>Name your workspace</FormLabel>
          <FormHelperText color="error.500">
            {fieldState.error?.message}
          </FormHelperText>
        </FormControl>
      )}
    />
    <FormControl>
      <Textarea {...form.register('description')} placeholder=" " />
      <FormLabel>Description</FormLabel>
      <FormHelperText>Optional</FormHelperText>
    </FormControl>
  </VStack>
);

const CreateWorkspacePage = () => {
  const {
    form,
    tabs,
    request,
    handleClose,
    handleGoToWorkspace,
    handleConfigureMembers,
  } = useCreateWorkspace();

  return (
    <Dialog.Modal isOpen onClose={handleClose} closeOnOverlayClick={false}>
      {tabs.is(CreateWorkspaceTabState.FORM) && (
        <Dialog.Header
          maxW={420}
          title="Create Workspace"
          description="Define the details of your vault. Set up this rules carefully because it cannot be changed later."
        />
      )}

      <Dialog.Body
        maxW={tabs.is(CreateWorkspaceTabState.ON_BOARDING) ? 540 : 420}
      >
        <Box hidden={!tabs.is(CreateWorkspaceTabState.FORM)} mb={12}>
          <StepProgress length={tabs.length} value={tabs.tab} />
        </Box>
        <Tabs index={tabs.tab} colorScheme="green">
          <TabPanels>
            <TabPanel p={0}>
              <OnboardingStep
                tabs={tabs}
                onCancel={handleClose}
                onConfirm={() => tabs.set(CreateWorkspaceTabState.FORM)}
              />
            </TabPanel>
            <TabPanel p={0}>
              <CreateWorkspaceForm form={form} />
            </TabPanel>
            <TabPanel p={0}>
              <FeedbackSuccess
                title="All set!!"
                description="The vault template is now ready for use whenever you need to streamline
        your workflow!"
                primaryAction="Go to my workspace"
                secondaryAction="Members Settings"
                onPrimaryAction={handleGoToWorkspace}
                onSecondaryAction={handleConfigureMembers}
                showAction
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Dialog.Body>

      <Dialog.Actions
        hidden={!tabs.is(CreateWorkspaceTabState.FORM)}
        maxW={420}
      >
        <Dialog.SecondaryAction onClick={handleClose}>
          Cancel
        </Dialog.SecondaryAction>
        <Dialog.PrimaryAction
          onClick={form.handleCreateWorkspace}
          leftIcon={<SquarePlusIcon />}
          isDisabled={request.isLoading}
          isLoading={request.isLoading}
        >
          Continue
        </Dialog.PrimaryAction>
      </Dialog.Actions>
    </Dialog.Modal>
  );
};

export { CreateWorkspacePage };
