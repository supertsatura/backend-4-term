const ProductItem = (props) => {
    const {
        product,
        onEdit,
        onDelete,
    } = props;

    return (
        <div className="product-card">
            <div className="product-card__main">
                <div className="product-card__id">{product.productID}</div>
                <div className="product-card__title">{product.productTitle}</div>
                <div className="product-card__category">{product.productCategory}</div>
                <div className="product-card__description">{product.productDescription}</div>
                <div className="product-card__price">{product.productPrice}</div>
            </div>
            <div className="product-card__actions">
                <button className="product-card__button product-card__button--edit"
                        onClick={() => onEdit(product)}
                >
                    Редактировать товар
                </button>
                <button className="product-card__button product-card__button--delete"
                        onClick={() => onDelete(product)}
                >
                    Удалить товар
                </button>
            </div>
        </div>
    )
}

export default ProductItem;