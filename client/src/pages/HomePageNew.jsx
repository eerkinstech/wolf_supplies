import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useElementorBuilder } from '../context/ElementorBuilderContext';
import ElementorBuilder from '../components/ElementorBuilder/ElementorBuilder';
import NodeRenderer from '../components/ElementorBuilder/NodeRenderer';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const { isEditing, rootNode, loadPage } = useElementorBuilder();
  // Load page blocks on mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
    loadPage('home');
  }, [dispatch, loadPage]);

  // Debug: Log page structure to console
  useEffect(() => {
    if (rootNode) {
      const findAllWidgets = (node, list = []) => {
        if (!node) return list;
        if (node.widgetType) {
          list.push({ type: node.widgetType, id: node.id, props: node.props });
        }
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(child => findAllWidgets(child, list));
        }
        return list;
      };
      const widgets = findAllWidgets(rootNode);
}
  }, [rootNode]);

  if (isEditing) {
    return <ElementorBuilder pageId="home" />;
  }

  return (
    <main className="min-h-screen">
      {rootNode ? (
        <NodeRenderer node={rootNode} isPreview />
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">Wolf Supplies
            <h1 className="text-3xl font-bold mb-4">Welcome to Wolf Supplies LTD</h1>
            <p className="text-gray-600">Home page is loading...</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default HomePage;
