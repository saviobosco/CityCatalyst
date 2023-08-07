import { useTranslation } from '@/i18n/client';
import { Link } from '@chakra-ui/next-js';
import { Text } from '@chakra-ui/react';
import Image from 'next/image';

export function NavigationBar({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'navigation');
  return (
    <div className="flex flex-row space-between px-8 py-4 align-middle bg-[#001EA7]">
      <Image src="/assets/logo.svg" width={36} height={36} alt="CityCatalyst logo" className="mr-[56px]" />
      <Text size="18" color="white" className="font-bold mt-1">{t('title')}</Text>
      <Link href="/help" color="white" size="16" className="opacity-75 mt-1 ml-auto">{t('help')}</Link>
    </div>
  )
}
