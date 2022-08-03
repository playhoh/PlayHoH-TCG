import React, {useEffect, useState} from 'react'

/** https://theran.dev/blog/2020/lazy-image */
const BlurryLoadingImage = ({
                                preview,
                                src,
                                bgColor = 'transparent',
                                ...props
                            }) => {
    const [currentImage, setCurrentImage] = useState(preview)
    const [loading, setLoading] = useState(true)

    const fetchImage = (src) => {
        const loadingImage = new Image()
        loadingImage.src = src
        loadingImage.onload = () => {
            setCurrentImage(loadingImage.src)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchImage(src)
    }, [])

    return (
        <img
            {...props}
            style={loading ? {
                filter: `${loading ? 'blur(20px)' : ''}`,
                transition: '1s filter linear',
                width: '100%',
                background: bgColor,
            } : props.style}
            src={currentImage}
        />
    )
}

export default BlurryLoadingImage