import {usePopularProducts, ProductCard} from '@shopify/shop-minis-react'
import CameraScreen from './CameraScreen'
import ResultsScreen from './ResultsScreen'

export function App() {
  // Mock data for demonstration
  const features = ['Oily skin', 'Curly hair', 'Oval face']
  const products = [
    { id: '1', title: 'Hydrating Serum', imageUrl: 'https://via.placeholder.com/80' },
    { id: '2', title: 'Curl Cream', imageUrl: 'https://via.placeholder.com/80' },
    { id: '3', title: 'Gold Hoop Earrings', imageUrl: 'https://via.placeholder.com/80' },
    { id: '4', title: 'Face Cleanser', imageUrl: 'https://via.placeholder.com/80' },
  ]

  const handleCapture = (image: { url: string; blob: Blob }) => {
    console.log('Captured image:', image)
    // TODO: Send image to analysis and show results screen
  }

  return (
    <ResultsScreen features={features} products={products} />
  )
}
