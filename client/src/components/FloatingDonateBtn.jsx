import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaHeart, FaTimes } from 'react-icons/fa';
import DonateModal from './DonateModal';

export default function FloatingDonateBtn() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="floating-donate" onClick={() => setOpen(true)}>
        <FaHeart /> {t('home.donate_now')}
      </button>
      {open && <DonateModal onClose={() => setOpen(false)} />}
    </>
  );
}
