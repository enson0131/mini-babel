import _tracker2 from "tracker";

function a() {
  _tracker2();

  console.log(`aaa`);
}

class B {
  bb() {
    _tracker2();

    return "bbb";
  }

}

const c = () => {
  _tracker2();

  return "ccc";
};

const d = function () {
  _tracker2();

  console.log("ddd");
};