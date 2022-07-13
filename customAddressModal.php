<?php 
  //  Fix CORS
  $module->setCORS();
?>
<!-- Modal -->
<div class="modal fade" id="custom-address-modal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">%TITLE%</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form id="custom-address-form" class="custom-address-form">
          <div class="modal-body">
                <div class="form-row">
                  <div class="col-md-9 mb-3">
                    <label for="custom-street">%STREET%</label>
                    <input required style="max-width: 100%!important;width: 100%!important;" type="text" class="form-control" id="custom-street">
                  </div>
                  <div class="col-md-3 mb-3">
                    <label for="custom-number">%NUMBER%</label>
                    <input required style="max-width: 100%!important;width: 100%!important;" type="text" class="form-control" id="custom-number">
                  </div>
                </div>
                <div class="form-row">
                  <div class="col-md-9 mb-3">
                    <label for="custom-city">%CITY%</label>
                    <input required style="max-width: 100%!important;width: 100%!important;"  type="text" class="form-control" id="custom-city">
                  </div>
                  <div class="col-md-3 mb-3">
                    <label for="custom-code">%CODE%</label>
                    <input required style="max-width: 100%!important;width: 100%!important;"  type="text" class="form-control" id="custom-code">
                  </div>                
                </div>
                <div class="form-row">
                  <div class="col-md-12 mb-3">
                    <label for="custom-country">%COUNTRY%</label>
                    <input required style="max-width: 100%!important;width: 100%!important;"  type="text" class="form-control" id="custom-country">                  
                  </div>
                </div>
                  <div class="form-group">
                    <label for="custom-note">%NOTE%</label>
                    <input style="max-width: 100%!important;width: 100%!important;"  type="text" class="form-control" id="custom-note">
                  </div>                   
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>
  </div>