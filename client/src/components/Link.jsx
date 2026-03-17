'use client';


import { Link as RouterLink, useNavigate } from 'react-router-dom';

function LinkComponent({ to, href, children, onClick, ...props }) {
  // Prefer 'to', fallback to 'href' for compatibility
  const url = to !== undefined ? to : (href || '/');
  const navigate = useNavigate();

  return (
    <RouterLink
      to={url}
      onClick={onClick}
      {...props}
    >
      {children}
    </RouterLink>
  );
}

export { LinkComponent as Link };
export default LinkComponent;
