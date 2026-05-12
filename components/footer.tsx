const Footer = ({
  shouldRemovePadding,
}: React.PropsWithChildren<{ shouldRemovePadding: boolean }>) => {
  return (
    <footer
      className={`absolute bottom-0 left-0 right-0 h-28 border-t-4 border-zinc-500 bg-dark text-center ${
        shouldRemovePadding ? "" : "md:left-72"
      } lg:text-left`}
    >
      <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center text-white">
        <div className="flex flex-col items-center space-y-2 md:block md:space-x-6 md:space-y-0">
          <span className="text-zinc-400">
            ©{new Date().getFullYear()} TzSafe community fork
          </span>

          <a
            href="https://github.com/Primate411/tzsafe-ui/issues"
            target="_blank"
            rel="noreferrer"
          >
            Contact
          </a>
          <a href="https://docs.tzsafe.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          <a href="https://tzkt.io/" target="_blank" rel="noreferrer">
            Powered by TzKT API
          </a>
          <span className="hidden text-zinc-500 md:inline">·</span>
          <a href="https://tez.capital/" target="_blank" rel="noreferrer">
            RPC by Tez Capital
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
