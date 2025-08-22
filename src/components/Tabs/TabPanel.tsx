interface TabPanelProps {
  value: string;
  children: React.ReactNode;
}

export const TabPanel = ({ value, children }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== 'panel1'}>
      {value === 'panel1' && children}
    </div>
  );
};
