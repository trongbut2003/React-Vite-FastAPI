import { motion, AnimatePresence } from "framer-motion";

function PageLoader({ loading }) {
  
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{zIndex: "1000", position: "fixed", top: "0", left: "0",width: "100%", height: "100%", backgroundColor: "black"}}>
          <img
            src="/img/Loading.gif"
            alt="Không load được"
            style={{zIndex: "1001", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)"}}
          />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageLoader;
