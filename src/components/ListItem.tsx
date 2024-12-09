import React from 'react';

interface ListItemProps {
  id: number;
  title: string;
  description: string;
  onItemClick: (id: number) => void;
}

// Use React.memo to prevent unnecessary re-renders
const ListItem: React.FC<ListItemProps> = React.memo(({ 
  id, 
  title, 
  description, 
  onItemClick 
}) => {
  console.log(`Rendering ListItem: ${id}`); // Helps track re-renders

  return (
    <div 
      onClick={() => onItemClick(id)}
      style={{
        border: '1px solid #ddd',
        padding: '10px',
        margin: '5px 0',
        cursor: 'pointer'
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
});

export default ListItem;
