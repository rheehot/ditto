import React from "react";
import SignInForm from "../SignInForm";
import Modal from "../Modal";

export interface SignInModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isVisible, onClose }) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} title="로그인" maxWidth="xs">
      <SignInForm />
    </Modal>
  );
};

export default SignInModal;
