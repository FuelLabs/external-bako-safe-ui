import {
  Accordion,
  AccordionItem,
  Button,
  Center,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';

import { AmountInput, Autocomplete, UserAddIcon } from '@/components';
import {
  AddToAddressBook,
  CreateContactDialog,
  useAddressBook,
  useAddressBookAutocompleteOptions,
} from '@/modules/addressBook';
import { useAuth } from '@/modules/auth/hooks';
import {
  AddressUtils,
  AssetSelect,
  delay,
  NativeAssetId,
} from '@/modules/core';
import {
  UseCreateTransaction,
  useCreateTransaction,
} from '@/modules/transactions/hooks';

import { TransactionAccordion } from './accordion';

interface TransactionAccordionProps {
  form: UseCreateTransaction['form'];
  nicks: UseCreateTransaction['nicks'];
  assets: UseCreateTransaction['assets'];
  accordion: UseCreateTransaction['accordion'];
  transactions: UseCreateTransaction['transactionsFields'];
  isFeeCalcLoading: boolean;
}

interface TransctionFormFieldProps {
  form: UseCreateTransaction['form'];
  index: number;
  assets: UseCreateTransaction['assets'];
  isFeeCalcLoading: boolean;
  isFirstLoading: boolean;
  setIsFirstLoading: (state: boolean) => void;
  estimatedBalance: string;
  setEstimatedBalance: (state: string) => void;
}

const TransactionFormField = ({
  form,
  assets,
  index,
  isFirstLoading,
  setIsFirstLoading,
  setEstimatedBalance,
  estimatedBalance,
}: TransctionFormFieldProps) => {
  const asset = form.watch(`transactions.${index}.asset`);

  const { isSingleWorkspace } = useAuth();
  const { account } = useAuth();

  const { getBalanceWithoutReservedAmount, transactionFee } =
    useCreateTransaction({
      onClose: () => console.log('ignore'),
      isFirstLoading,
      initialBalance: assets.getCoinBalance(asset),
      to: account,
      assetId: NativeAssetId,
    });

  useEffect(() => {
    if (transactionFee?.length && isFirstLoading) {
      setIsFirstLoading(false);
      const balanceWithoutReservedAmountAndEstimatedFee =
        getBalanceWithoutReservedAmount(
          assets.getCoinBalance(asset),
          transactionFee,
        );

      setEstimatedBalance(balanceWithoutReservedAmountAndEstimatedFee);
    }
  }, [transactionFee?.length]);

  const {
    workspaceId,
    createContactRequest,
    handleOpenDialog,
    form: contactForm,
    contactDialog,
    listContactsRequest,
    inView,
    canAddMember,
  } = useAddressBook(!isSingleWorkspace);

  const { optionsRequests, handleFieldOptions, optionRef } =
    useAddressBookAutocompleteOptions({
      workspaceId: workspaceId!,
      includePersonal: !isSingleWorkspace,
      contacts: listContactsRequest.data!,
      fields: form.watch('transactions')!,
      errors: form.formState.errors.transactions,
      isUsingTemplate: false,
      isFirstLoading: false,
      dynamicCurrentIndex: index,
      canRepeatAddresses: true,
    });

  return (
    <>
      <CreateContactDialog
        form={contactForm}
        dialog={contactDialog}
        isLoading={createContactRequest.isLoading}
        isEdit={false}
      />
      <VStack spacing={5}>
        <Controller
          name={`transactions.${index}.value`}
          control={form.control}
          render={({ field, fieldState }) => {
            const appliedOptions = handleFieldOptions(
              field.value,
              optionsRequests[index].options,
            );

            const showAddToAddressBook =
              canAddMember &&
              !fieldState.invalid &&
              AddressUtils.isValid(field.value) &&
              optionsRequests[index].isSuccess &&
              listContactsRequest.data &&
              !listContactsRequest.data
                .map((o) => o.user.address)
                .includes(field.value);

            return (
              <FormControl isInvalid={fieldState.invalid}>
                <Autocomplete
                  value={field.value}
                  label={`Recipient ${index + 1} address`}
                  onChange={field.onChange}
                  isLoading={!optionsRequests[index].isSuccess}
                  options={appliedOptions}
                  inView={inView}
                  clearable={false}
                  isFromTransactions
                  optionsRef={optionRef}
                />
                <FormHelperText color="error.500">
                  {fieldState.error?.message}
                </FormHelperText>
                <AddToAddressBook
                  visible={showAddToAddressBook}
                  onAdd={() => handleOpenDialog?.({ address: field.value })}
                />
              </FormControl>
            );
          }}
        />
        <Controller
          name={`transactions.${index}.asset`}
          control={form.control}
          render={({ field, fieldState }) => (
            <AssetSelect
              isInvalid={fieldState.invalid}
              assets={assets!.assets!}
              name={`transaction.${index}.asset`}
              value={field.value}
              onChange={field.onChange}
              helperText={
                <FormHelperText
                  color={fieldState.invalid ? 'error.500' : 'grey.200'}
                >
                  {fieldState.error?.message ??
                    'Select the asset you want to send'}
                </FormHelperText>
              }
            />
          )}
        />
        <Controller
          name={`transactions.${index}.amount`}
          control={form.control}
          render={({ field, fieldState }) => (
            <FormControl>
              <AmountInput
                placeholder=" "
                value={field.value}
                onChange={field.onChange}
                isInvalid={fieldState.invalid}
              />
              <FormLabel color="gray">Amount</FormLabel>
              <FormHelperText>
                {asset && (
                  <Text display="flex" alignItems="center">
                    Balance (available): {assets.getAssetInfo(asset)?.slug}{' '}
                    {/* {balanceWithoutReservedAmount} */}
                    {estimatedBalance}
                  </Text>
                )}
              </FormHelperText>
              <FormHelperText color="error.500">
                {fieldState.error?.message}
              </FormHelperText>
            </FormControl>
          )}
        />
      </VStack>
    </>
  );
};

const TransactionAccordions = (props: TransactionAccordionProps) => {
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [estimatedBalance, setEstimatedBalance] = useState('');

  const { form, transactions, assets, accordion, nicks, isFeeCalcLoading } =
    props;

  //console.log(aux);
  // const _asset_inputs = form
  //   .watch(`transactions`)
  //   ?.filter((t) => Number(t.amount) > 0)
  //   ?.reduce((t, acc) => t.add(bn.parseUnits(acc.amount)), bn(0));

  // const asset_fee =

  return (
    <Accordion
      index={accordion.index}
      overflowY="auto"
      maxH={450}
      pr={{ base: 1, sm: 4 }}
      sx={{
        '&::-webkit-scrollbar': {
          width: '5px',
          maxHeight: '330px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#2C2C2C',
          borderRadius: '30px',
          height: '10px' /* Adjust the height of the scrollbar thumb */,
        },
      }}
    >
      {transactions.fields.map((field, index) => {
        const transaction = form.watch(`transactions.${index}`);
        const assetSlug = assets.getAssetInfo(transaction.asset)?.slug;
        const fieldState = form.getFieldState(`transactions.${index}`);

        const hasEmptyField = Object.values(transaction).some(
          (value) => value === '',
        );

        const currentAmount = form.watch(`transactions.${index}.amount`);
        const isCurrentAmountZero = Number(currentAmount) === 0;

        const isDisabled =
          hasEmptyField || fieldState.invalid || isCurrentAmountZero;
        const contact = nicks.find(
          (nick) => nick.user.address === transaction.value,
        );

        return (
          <>
            <AccordionItem
              key={field.id}
              mb={6}
              borderWidth={1}
              borderColor="dark.600"
              borderRadius={10}
              backgroundColor="dark.600"
            >
              <TransactionAccordion.Item
                title={`Recipient ${index + 1}`}
                actions={
                  <TransactionAccordion.Actions>
                    <HStack spacing={4}>
                      <TransactionAccordion.EditAction
                        onClick={() => accordion.open(index)}
                      />
                      <TransactionAccordion.DeleteAction
                        isDisabled={props.transactions.fields.length === 1}
                        onClick={() => {
                          transactions.remove(index);
                          accordion.close();
                        }}
                      />
                    </HStack>
                    <TransactionAccordion.ConfirmAction
                      onClick={() => accordion.close()}
                      isDisabled={isDisabled}
                      isLoading={
                        !isCurrentAmountZero ? isFeeCalcLoading : false
                      }
                    />
                  </TransactionAccordion.Actions>
                }
                resume={
                  !hasEmptyField && (
                    <Text fontSize="sm" color="grey.500" mt={2}>
                      <b>
                        {transaction.amount} {assetSlug}
                      </b>{' '}
                      to{' '}
                      <b>
                        {' '}
                        {contact?.nickname ??
                          AddressUtils.format(transaction.value)}
                      </b>
                    </Text>
                  )
                }
              >
                <TransactionFormField
                  isFirstLoading={isFirstLoading}
                  setIsFirstLoading={setIsFirstLoading}
                  setEstimatedBalance={setEstimatedBalance}
                  estimatedBalance={estimatedBalance}
                  index={index}
                  form={form}
                  assets={assets}
                  isFeeCalcLoading={isFeeCalcLoading}
                />
              </TransactionAccordion.Item>
            </AccordionItem>
          </>
        );
      })}
      <Center mt={6}>
        <Button
          w="full"
          leftIcon={<UserAddIcon />}
          variant="primary"
          bgColor="grey.200"
          border="none"
          _hover={{
            opacity: 0.8,
          }}
          onClick={() => {
            transactions.append({
              amount: '',
              asset: NativeAssetId,
              value: '',
            });
            delay(() => accordion.open(transactions.fields.length), 100);
          }}
        >
          Add more recipients
        </Button>
      </Center>
    </Accordion>
  );
};

export { TransactionAccordions };
