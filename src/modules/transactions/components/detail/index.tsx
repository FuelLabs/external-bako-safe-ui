import {
  Badge,
  Box,
  Button,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  InputGroup,
  InputRightAddon,
  Text,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import { Loader } from '@/components';
import { assetsMap } from '@/modules/core';

import { GetTransactionResponse, TransactionDetailUI } from '../../services';
import { TransactionList } from '../transaction-list';

const colorMap = {
  PENDING: 'yellow',
  DONE: 'green',
};

function BodyTransactionDetails({
  transaction,
  transferData,
  signin,
  isLoading,
  isLoadingRequest,
}: {
  transferData: TransactionDetailUI;
  transaction: GetTransactionResponse;
  signin: (hash: string, id: string, predicateID: string) => void;
  isLoading: boolean;
  isLoadingRequest: boolean;
  //set: (value: boolean) => void
}) {
  const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);

  useEffect(() => {
    setIsLoadingButton(
      !!transaction &&
        !transferData?.assigned &&
        !transferData?.isDone &&
        !!transaction.predicateID &&
        transferData?.isSigner,
    );

    //set(isLoading)
  }, [transaction, transferData]);

  console.log({ transferData, transaction });

  return !!transferData && !!transaction ? (
    <CardBody>
      {transferData?.isDone && transaction?.sendTime && (
        <CardHeader>
          <Flex width="100%" justifyContent="space-between" ml={-3}>
            <Heading color="white" size="md">
              Geral
            </Heading>
          </Flex>
          <Flex width="100%" justifyContent="space-between" ml={-3}>
            <Flex flexDirection="column" mt={2} mb={2}>
              <Text color="gray">Gás used: {transaction?.gasUsed}</Text>
              <Text color="gray">
                Time: {format(new Date(transaction?.sendTime), 'Pp')}
              </Text>
            </Flex>
            <Flex mt={2} mb={2} mr={-5}>
              <Button
                width="100%"
                size="lg"
                color="brand.900"
                variant="solid"
                colorScheme="brand"
                onClick={() => {
                  window.open(transferData?.fuelRedirect, '_blank');
                }}
              >
                View on explorer
              </Button>
            </Flex>
          </Flex>
        </CardHeader>
      )}
      {isLoading && <Loader w={500} h={100} />}
      <CardHeader>
        <Flex width="100%" justifyContent="space-between" ml={-3}>
          <Heading color="white" size="md">
            Transactions
          </Heading>
        </Flex>
      </CardHeader>
      <Box mb={8}>
        <TransactionList
          assets={
            transferData?.transfers?.map((transfer) => ({
              assetId: transfer.assetID,
              name: assetsMap[transfer.assetID].name,
              amount: transfer.amount,
              slug: assetsMap[transfer.assetID].slug,
              to: transfer.to,
            })) ?? []
          }
        />
      </Box>
      <CardHeader>
        <Flex width="100%" justifyContent="space-between" ml={-3}>
          <Heading color="white" size="md">
            Signers
          </Heading>
        </Flex>
        {transferData?.minSigners - transferData?.totalSigners > 0 && (
          <Box mb={6} ml={-3} mt={2}>
            <Flex w="100%">
              <Text color="gray">
                {`Missing ${
                  transferData?.minSigners - transferData?.totalSigners
                } signature of ${transferData?.minSigners} required.`}
              </Text>
            </Flex>
          </Box>
        )}
      </CardHeader>
      <Box mb={8}>
        {!!transferData?.signers &&
          transferData?.signers.map((item, index) => {
            return (
              <Box
                mb={4}
                key={index}
                background="dark.100"
                borderRadius={8}
                color="white"
                padding={2}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex alignItems="center">
                    <Text>
                      {String(item.address).slice(0, 6)}...
                      {String(item.address).slice(-9)}
                    </Text>
                  </Flex>

                  <Flex alignItems="center">
                    <InputGroup>
                      <InputRightAddon borderColor="dark.100" bg="dark.100">
                        {item.signed ? (
                          <Badge colorScheme={colorMap['DONE']}>DONE</Badge>
                        ) : (
                          <Badge colorScheme={colorMap['PENDING']}>
                            PENDING
                          </Badge>
                        )}
                      </InputRightAddon>
                    </InputGroup>
                  </Flex>
                </Flex>
              </Box>
            );
          })}
      </Box>

      <Box mb={2}>
        {isLoadingButton && (
          <Button
            w="100%"
            color="brand.900"
            variant="solid"
            colorScheme="brand"
            onClick={() => {
              signin(
                transaction?.hash,
                transaction?.id,
                transaction?.predicateID,
              );
            }}
            disabled={isLoading || isLoadingRequest}
            isLoading={isLoading || isLoadingRequest}
          >
            Confirm
          </Button>
        )}
      </Box>
    </CardBody>
  ) : (
    <></>
  );
}

export { BodyTransactionDetails };
