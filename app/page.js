'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }
  
  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, "inventory"), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        await setDoc(docRef, { quantity: quantity + 1 })
      } else {
        await setDoc(docRef, { quantity: 1 })
      }
      await updateInventory();
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const removeItem = async (item) => {
    try { 
      const docRef = doc(collection(firestore, "inventory"), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await deleteDoc(docRef);
      } 
      await updateInventory();
    } catch(error) {
      console.error("Error removing item: ", error);
    }
  };

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      bgcolor={'#99d1e1'}  // Pastel background color
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>

      <TextField
        label="Search Items"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ 
          width: '1000px', 
          marginBottom: 2, 
          bgcolor: 'white'  // Set the background color to white
        }}
      />

<Box border={'1px solid #333'}>
  <Box
    width="1000px"  // Updated width
    height="100px"
    bgcolor={'#d9dad9'}  // Light blue header background
    display={'flex'}
    justifyContent={'center'}
    alignItems={'center'}
  >
    <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
      Inventory Items
    </Typography>
  </Box>
   <Stack
  width="1000px"
  overflow="auto"
  spacing={0}
  sx={{ padding: 0, height: 'auto', maxHeight: '300px' }} // Dynamic height with a max limit
>
  {filteredInventory.map(({ name, quantity }) => (
    <Box
      key={name}
      width="100%"
      minHeight="80px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bgcolor="#f0f0f0"
      paddingX={1}
      sx={{ borderBottom: '1px solid #ccc' }}
    >
      <Typography variant="body1" color="#333" textAlign="left" sx={{ flex: 1, marginRight: 1 }}>
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </Typography>
      <Typography variant="body1" color="#333" textAlign="center" sx={{ flex: 1, marginRight: 1 }}>
        Quantity: {quantity}
      </Typography>
      <Button variant="contained" onClick={() => removeItem(name)} sx={{ minWidth: '70px', flexShrink: 0 }}>
        Remove
      </Button>
    </Box>
  ))}
</Stack>
 </Box>
</Box>
);
}
