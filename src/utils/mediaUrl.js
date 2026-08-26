const API_BASE_URL =
  ''

function resolveMediaUrl(imageUrl) {
  if (!imageUrl) {
    return ''
  }

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('blob:')
  ) {
    return imageUrl
  }

  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`
  }

  return `${API_BASE_URL}/${imageUrl}`
}

export default resolveMediaUrl