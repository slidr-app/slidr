import Loading from '../components/Loading';
import Message from '../components/Message';

const PdfLoading = <Loading message="Loading pdf..." />;
const PdfError = <Message>Loading PDF failed.</Message>;
const PdfNoData = <Message>No PDF file found.</Message>;

const PageLoading = <Loading message="Loading page..." />;
const PageError = <Message>Failed to load page.</Message>;

export const pdfMessageProperties = {
  loading: PdfLoading,
  error: PdfError,
  noData: PdfNoData,
};

export const pageMessageProperties = {
  loading: PageLoading,
  error: PageError,
};
