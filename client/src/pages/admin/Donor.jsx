import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { donorsListRoute, userStatusUpdateRoute } from '../../utils/ApiRoutes';
import { Button, Container, Row } from 'react-bootstrap';
import ReactTable from '../../components/ReactTable';
import { donorPatientHeaders } from '../../utils/tableHeaders/donorPatinetHeaders';
import { toast } from 'react-toastify';
import { refreshToastOptions, toastOptions } from '../../utils/toasOptions';

export const Donor = () => {

  const navigate = useNavigate();
  const [donorList, setDonorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(donorPatientHeaders);

  const api = axios.create({
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  }); 

  const getDonors = useCallback ( async () => {
    try {
      const res = await api.get(donorsListRoute);

      if (res.data.success) {
        setDonorList(res.data.donors);
      }
      
    }
    catch (err) {
      console.log(err.response);
      if (!err.response.data.success) {
        navigate('/error');
      }
    }
    finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
    // eslint-disable-next-line
  }, [navigate])

  useEffect(() => {
    getDonors();
  }, [getDonors]);
  
  const updateStatus = async (id,status) => {
    try {
      status = status === 'Verify' ? 'verified' : 'rejected';
      let route = `${userStatusUpdateRoute}/${id}/${status}`;
      const res = await api.post(route);
      if (res.data.success === true) {
        setDonorList((prevDonorList) => {
          return prevDonorList.map((donor) => {
            if (donor._id === id) {
              return { ...donor, status };
            }
            return donor;
          });
        });
      };
    }
    catch (error) {
      console.log(error.response.data);
      toast.error('Failed to update the status', toastOptions);
    }
  }

  useEffect(() => {
    setColumns([...donorPatientHeaders,{
      dataField: "Actions",
      isDummyField: true,
      text: "Actions",
      headerStyle: {
        backgroundColor: "#DEDADA",
        width: '10rem'
      },
      formatter: (cell, row) => {
        return (  <>
          <Button
            onClick={(e) => updateStatus(row._id, e.currentTarget.innerText)}
            variant={row.status === 'rejected' ? 'success' : 'danger'}
            size="sm">
            {row.status === 'rejected' ? 'Verify' : 'Reject'}
          </Button>
          <Button
            className='ms-3'
            onClick={(e) => updateStatus(row._id, e.currentTarget.innerText)}
            variant={row.status === 'pending' ? 'success' : null}
            size="sm">
            {row.status === 'pending' ? 'Verify' : null}
          </Button>
        </>
      )}
    }])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donorPatientHeaders]);

  const refreshTable = () => {
    getDonors();
    toast.success('donors list updated', refreshToastOptions);
  }
 
  return (
    <>
      { loading ? (
        <LoadingSpinner />
      ) : (
        <Container className='p-5 d-flex flex-column ' style={{ height: '100vh', overflowY: 'auto' }} >
          <Row>
            <h3 className="text-left fs-1 mb-3 text-capitalize">Donors ready to Tranfuse</h3>
          </Row>
          <Row>
            <ReactTable
              pageSize={8}
              data={donorList.reverse()}
              columns={columns}
              refreshTable={refreshTable}
            />
          </Row>
        </Container>  
      )}
    </>
  );
};
