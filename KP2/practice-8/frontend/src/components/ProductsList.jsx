import ProductItem from "./ProductItem.jsx";

const ProductsList = (props) => {
    const {
        products,
        onEdit,
        onDelete
    } = props;

    if (products.length === 0) {
        return (
            <div className="products-list__empty">
                Товаров нет
            </div>
        );
    }

    return (
        <div className="products-list">
            {products.map((product) => (
                <ProductItem
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default ProductsList;