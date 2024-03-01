function f5() {
  function f6() {
    console.log(g);
    var g = 1;
  }
  f6();
}
f5();
