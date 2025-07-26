import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import "../style/LoadingButton.css";

function LoadingButton({ name, loadingText, onClick,className }) {
  const [isLoading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick(); // Call the provided onClick function
      setLoading(false); // Set isLoading back to false after onClick function is executed
    } catch (error) {
      // Handle any errors
      console.error(error);
      setLoading(false); // Set isLoading back to false in case of error
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