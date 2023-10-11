import { yupResolver } from '@hookform/resolvers/yup';
import { useFieldArray, useForm } from 'react-hook-form';

import { ITemplatePayload } from '@/modules/core';

import { AddressStep, InfoStep, SuccesStep } from '../components';
import { schema } from './useAddressesValidate';
import { useModal } from './useModal';

export interface IStep {
  component: React.ReactNode;
  hiddeTitle: boolean;
  hiddeFooter: boolean;
  hiddeProgressBar: boolean;
  onSubmit: (data: ITemplatePayload) => void;
  isLoading: boolean;
}
import { useNavigate } from 'react-router-dom';

import { useTemplateStore } from '../store';
import { useCreate } from './useCreateTemplate';
const useSteps = () => {
  const { nextStep } = useModal();
  const navigate = useNavigate();
  const { templateFormInitial } = useTemplateStore();
  const { createTemplate, isLoading } = useCreate();
  const { handleSubmit, ...form } = useForm<ITemplatePayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      addresses: templateFormInitial.addresses.map((item: string) => {
        return {
          value: item,
        };
      }),
      minSigners: templateFormInitial.minSigners || 1,
    },
  });

  const addressesFieldArray = useFieldArray<ITemplatePayload>({
    control: form.control,
    name: 'addresses' as never,
  });

  const steps: IStep[] = [
    {
      component: <InfoStep form={{ handleSubmit, ...form }} />,
      hiddeTitle: false,
      hiddeFooter: false,
      hiddeProgressBar: false,
      isLoading,
      onSubmit: (data) => {
        nextStep();
      },
    },
    {
      component: <AddressStep form={{ handleSubmit, ...form }} />,
      hiddeTitle: false,
      hiddeFooter: false,
      hiddeProgressBar: false,
      isLoading,
      onSubmit: async (data) => {
        const { addresses } = data;
        const add = addresses as unknown as { value: string }[];

        await createTemplate({
          ...data,
          addresses: add.map((item) => item.value),
        });
        nextStep();
      },
    },
    {
      component: <SuccesStep />,
      hiddeTitle: true,
      hiddeFooter: true,
      hiddeProgressBar: true,
      isLoading,
      onSubmit: (data) => {
        navigate(-1);
      },
    },
  ];

  const onClose = () => {
    navigate(-1);
    form.reset();
  };

  return { steps, handleSubmit, form, addresses: addressesFieldArray, onClose };
};

export { useSteps };
