import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import "../../style/LoadingButton.css";

function LoadingButton({ name, loadingText, onClick,className }) {
  const [isLoading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={isLoading}
      onClick={!isLoading ? handleClick : null}
      size="md"
      bsPrefix ='btn'
      className={`custom-Btn ${className}`}
    >
      {isLoading ? loadingText : name}
    </Button>
  );
}

export default LoadingButton;