import { useState } from "react";
import {
  Lock,
  Save,
} from "lucide-react";
import profileApi from "../../api/profileApi";

function Password() {


  const [form,setForm]=useState({

    current_password:"",
    password:"",
    password_confirmation:""

  });


  const [message,setMessage]=useState("");

  const [error,setError]=useState("");

  const [loading,setLoading]=useState(false);



  const handleChange=(e)=>{

    setForm({

      ...form,

      [e.target.name]:
        e.target.value

    });

  };



  const handleSubmit=async(e)=>{

    e.preventDefault();


    setLoading(true);

    setMessage("");

    setError("");



    try{


      const response =
        await profileApi.changePassword(form);



      setMessage(
        response.data.message ||
        "Đổi mật khẩu thành công."
      );



      setForm({

        current_password:"",
        password:"",
        password_confirmation:""

      });



    }catch(error){


      setError(

        error.response?.data?.message ||
        "Đổi mật khẩu thất bại."

      );


    }finally{

      setLoading(false);

    }

  };



  return (

    <div className="max-w-xl space-y-6">


      <h1 className="text-3xl font-bold text-slate-800">

        Đổi mật khẩu

      </h1>



      <form

        onSubmit={handleSubmit}

        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"

      >


        {
          message &&

          <div className="rounded-xl bg-emerald-50 p-4 text-emerald-600">

            {message}

          </div>

        }


        {
          error &&

          <div className="rounded-xl bg-red-50 p-4 text-red-600">

            {error}

          </div>

        }



        {
          [
            [
              "current_password",
              "Mật khẩu hiện tại"
            ],
            [
              "password",
              "Mật khẩu mới"
            ],
            [
              "password_confirmation",
              "Xác nhận mật khẩu"
            ]

          ].map(([name,label])=>(


            <div key={name}>

              <label className="mb-2 block font-semibold">

                {label}

              </label>


              <input

                type="password"

                name={name}

                value={form[name]}

                onChange={handleChange}

                className="w-full rounded-xl border px-4 py-3"

              />


            </div>


          ))

        }



        <button

          disabled={loading}

          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"

        >

          <Save size={18}/>

          {loading
            ? "Đang đổi..."
            : "Đổi mật khẩu"}

        </button>



      </form>


    </div>

  );

}


export default Password;